const express = require('express')
const router= express.Router()
const { ensureAuth } = require('../middleware/auth')

const Story = require('../models/Story')

// Show Add page || GET /stories/add
router.get('/add', ensureAuth, (req, res) => {
    res.render('stories/add')
})

// Process add form || POST /stories
router.post('/', ensureAuth, async (req,res) => {
    try {
        req.body.user = req.user.id
        await Story.create(req.body)
        res.redirect('/dashboard')
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

// Show all stories || GET /stories
router.get('/', ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({ status: 'public' })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean()

        res.render('stories/index', { stories })
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

// Show edit page || GET /stories/edit/:id
router.get('/edit/:id', ensureAuth, async (req, res) => {
    try {
        const story = await Story.findOne({
            _id: req.params.id
        }).lean()

        if(!story) {
            return res.render('error/404')
        }

        if(story.user != req.user.id) {
            return res.redirect('/stories')
        } else {
            res.render('stories/edit', {
                story
            })
        }
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

// Update story || PUT /stories/:id
router.put('/:id', ensureAuth, async (req, res) => {
    try {
        let story = await Story.findById(req.params.id).lean()

        if(!story) {
            return res.render('error/404')
        }
        if(story.user != req.user.id) {
            return res.redirect('/stories')
        } else {
            story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
                new: true,
                runValidators: true
            })
    
            res.redirect('/dashboard')
        }
    } catch (err) {
        console.error(err)
        return res.render('error/500')
    }
})

// Delete story || DELETE /stories/:id
router.delete('/:id', ensureAuth, async (req, res) => {
    try {
        await Story.findByIdAndDelete(req.params.id)
        res.redirect('/dashboard')
    } catch (err) {
        console.error(err)
        return res.render('error/500')
    }
})


module.exports = router