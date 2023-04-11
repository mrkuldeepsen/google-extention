const { Op } = require("sequelize")
const { Group, GroupMember, User, } = require("../models")
const { createGroup, updateGroup, addMembersInGroup } = require("../utils/common")

const { handleError, handleResponse, getPagination, sortingData, handleSearchQuery, getPagingResults, getResponse, getGroupData, getGroupMembers } = require('../utils/helper')

//Create group

exports.create = async (req, res) => {

    const { name, short_description, description, member_IDs, } = req.body

    const { error } = createGroup.validate(req.body, { abortEarly: false })

    if (error) {
        handleError(error, req, res)
        return
    }

    member_IDs.map((id) => {
        return id
    })

    const data = {
        name: name,
        short_description: short_description,
        description: description,
        admin_id: req.user.id
    }


    Group.create(data).then(async (data) => {
        const memberIDs = []
        const memId = []

        memId.push(data.admin_id)
        memId.push(...req.body.member_IDs)

        memId.map((item) => {
            memberIDs.push({
                group_id: data.id,
                admin_id: req.user.id,
                member_id: item,
            })
        })

        await GroupMember.bulkCreate(memberIDs)

        await Group.findOne({
            include: [{ model: GroupMember, }]
        })

            .then(dt => {
                handleResponse(res, dt)

            }).catch((err) => {
                console.log(err);
            })
    })
        .catch((err) => {
            handleError(err, req, res)
        })
}

// exports.findAll = (req, res) => {
//     const { page, size, sort, } = req.query
//     const { limit, offset } = getPagination(page, size)
//     const sortResponse = sortingData(req)

//     Group.findAndCountAll({
//         where: handleSearchQuery(req, ['name', 'description', 'admin_id']),
//         order: [[sortResponse.sortKey, sortResponse.sortValue]],
//         limit, offset,
//         include: [{ model: GroupMember }]
//     })
//         .then(async (data) => {
//             // const getGroup = await getGroupData(data)
//             handleResponse(res, getPagingResults(data, page, limit))
//         }).catch((err) => {

//             console.log(err);
//         })
// }


exports.findAll = async (req, res) => {

    const goupList = await GroupMember.findAll({
        where: {
            member_id: req.user.id
        }
    }).then(v => {
        const swdfgb = v.map(v => v.group_id)
        Group.findAll({
            where: {
                id: {
                    [Op.in]: swdfgb
                }
            },
            include: [{
                model: GroupMember,
            }]
        })
            .then(async (data) => {
                await getGroupData(data)
                handleResponse(res, data)
            }).catch((err) => {

                console.log(err);
            })
    })


}



exports.findOne = async (req, res) => {
    await Group.findAll({
        where: { id: req.params.id, },
        include: [{ model: GroupMember }]
    }).then(async data => {
        if (data === null) {
            return handleError('Invailid group ID', req, res)
        }
        await getGroupData(data)
        handleResponse(res, data)
    }).catch((err) => {
        handleError(err, req, res)
    })
}

exports.update = async (req, res) => {

    const { name, short_description, description, } = req.body

    const { error } = updateGroup.validate(req.body, { abortEarly: false })

    if (error) {
        handleError(error, req, res)
        return
    }
    const data = {
        name: name,
        short_description: short_description,
        description: description,
        admin_id: req.admin_id
    }

    const group = await Group.findOne({ where: { id: req.params.id, admin_id: req.user.id } })

    if (!group) {
        handleError('Invalid group ID', req, res)
    }

    else {

        Group.update(data, { where: { id: req.params.id, admin_id: req.user.id } })
            .then(async (data) => {

                getResponse(res, 'Group has been updated')

            })
            .catch(err => {
                handleError(err, req, res)
            })
    }
}

exports.addGroupMember = async (req, res) => {

    const { error } = addMembersInGroup.validate(req.body, { abortEarly: false })

    if (error) {
        handleError(error, req, res)
        return
    }

    await Group.findOne({ where: { id: req.params.group_id } })
        .then(async (groupData) => {
            const user = await User.findOne({ where: { id: req.body.member_IDs } })

            if (!groupData) {
                handleError('This group is not exist!', req, res)
            } else if (groupData.admin_id !== req.user.id) {
                handleError('Can not add members!', req, res)
            }
            else
                if (!user) {
                    handleError('This member is not exist!', req, res)
                }

                else {
                    const memberIDs = []
                    const memId = []

                    memId.push(groupData.admin_id)
                    memId.push(...req.body.member_IDs)

                    memId.map((item) => {
                        memberIDs.push({
                            group_id: req.params.group_id,
                            admin_id: req.user.id,
                            member_id: item,
                        })
                    })

                    await GroupMember.bulkCreate(memberIDs)
                        .then(data => {
                            handleResponse(res, data)

                        }).catch((err) => {
                            handleError(err, req, res)
                        })
                }
        })
        .catch((err) => {
            handleError(err, req, res)
        })

}

exports.removeGroup = async (req, res) => {
    const getGroup = await Group.findOne({ where: { id: req.params.group_id } })
    if (!getGroup) {

        handleError('Invalid group Id', req, res)
    }
    else {
        const group = await Group.findOne({ where: { admin_id: req.user.id } })
        if (!group) {
            handleError('Group can be deleted by admin only', req, res)
        }
        else {
            const deleteGroup = await Group.destroy({ where: { id: req.params.group_id, admin_id: req.user.id } })
            if (deleteGroup === 1) {
                await GroupMember.destroy({ where: { group_id: req.params.group_id } }).then(data => {
                    getResponse(res, 'Group has been successfully deleted')
                }).catch((err) => {
                    handleError('eeee', req, res)
                })
            }
        }
    }
}

exports.removeGroupMember = async (req, res) => {
    if(req.params.member_id===req.user.id)
       return  handleError("Admin can't left himself", req, res)

    const getMember = await GroupMember.findOne({ where: { group_id: req.params.group_id, member_id: req.params.member_id,admin_id:req.user.id
     } })
    if (getMember === null) {
        return handleError('Invalid group and member IDs', req, res)

    } else {

        await GroupMember.destroy({ where: { group_id: req.params.group_id, member_id: req.params.member_id } })
            .then(data => {
                getResponse(res, 'Member has been successfully removed')
            })
            .catch((err) => {
                handleError(err, req, res)
            })
    }
}

exports.addArticle = async (req, res) => {

    await Group.findOne({
        where: { id: req.params.id }
    })
        .then(async (groupData) => {
            if (groupData === null) { handleError('This group is not exist!', req, res) }

            else {



            }

        })
}




// const d = data.map((val) => val.group_members)
                
// const x = await getGroupMembers(d)
// console.log(x);
// res.json(x)
// const getGroup = await getGroupMembers(data)
// // const {data:members,error} = await getGroupMembers(data.map(v => v.group_members.map(ev => ev.member_id)))
// // console.log(members,error);