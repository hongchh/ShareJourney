const Record = require('../model/record')
const Online = require('../model/online')
const Favorite = require('../model/favorite')
const User = require('../model/user')
const ObjectId = require('mongoose').Schema.ObjectId
let api = require('express').Router()

// 发表记录
api.post('/post', (req, res) => {
  Online.findById(req.body.onlineId).then(online => {
    if (!online || !req.body.title || !req.body.content) {
      res.json({ result: 'error' })
    } else {
      new Record({
        title: req.body.title,
        content: req.body.content,
        image: req.body.image,
        audio: req.body.audio,
        video: req.body.video,
        userId: online.userId,
        date: new Date().getTime()
      }).save().then(record => {
        res.json({ result: 'ok', record })
      })
    }
  })
})

// 删除记录
api.get('/delete', (req, res) => {
  Online.findById(req.params.onlineId).then(online => {
    if (!online) {
      res.json({ result: 'error' })
    } else {
      Record.findById(req.params.recordId).then(record => {
        if (record.userId != online.userId) {
          res.json({ result: 'error' })
        } else {
          Record.remove({ _id: new ObjectId(req.params.recordId) }).then(() => {
            res.json({ result: 'ok' })
          })
        }
      })
    }
  })
})

// 查看所有记录
api.get('/all', (req, res) => {
  Record.find({}).then(records => {
    let count = records.length;
    count ? '' : res.json({ result: 'ok', records })
    for (let i = 0; i < records.length; ++i) {
      ((i) => {
        User.findById(records[i].userId).then(user => {
          user ? records[i].userAvatar = user.avatar : ''
          count ? --count : res.json({ result: 'ok', records })
        })
      })(i)
    }
  })
})

// 查看某条记录
api.get('/detail', (req, res) => {
  Record.findById(req.params.recordId).then(record => {
    record.favoriter = []
    Favorite.find({ _id: new ObjectId(req.params.recordId) }).then(records => {
      let count = records.length;
      count ? '' : res.json({ result: 'ok', record })
      for (let i = 0; i < records.length; ++i) {
        User.findById(records[i].userId).then(user => {
          user ? record.favoriter.push(user.avatar) : ''
          count ? --count : res.json({ result: 'ok', record })
        })
      }
    })
  })
})

// TODO: 点赞
api.get('/favorite', (req, res) => {
  res.json({})
})

module.exports = api
