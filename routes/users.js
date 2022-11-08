const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const jwt = require("jsonwebtoken");
const { SECRET_KEY, DB_URI } = require("../config");
const User = require('../models/user');
const Message = require('../models/message');
const {authenticateJWT, ensureCorrectUser, ensureLoggedIn} = require('../middleware/auth');



/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get('/', async (req, res, next) => {
    try{
        const results = await User.all()
        
        if(results.rows === 0){
            throw new ExpressError('Users not found', 404)
        }

        return res.json({users: results.rows})
    }catch(e) {
        return next(e)
    }
})


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/


router.get('/:username', async (req, res, next) => {
    try {
        const {username} = req.params
        const results = await User.get(username)
        
        if(!results.rows[0]){
            throw new ExpressError('User not found', 404)
        }

        return res.json({user: results.rows[0]})
    } catch (error) {
        return next(error)
    }
});


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get('/:username/to', async (req, res, next) => {
    try {
        const {username} = req.params
        const results = await User.messagesTo(username)

        if(results.rows === 0){
            throw new ExpressError('No messages to this user', 404)
        }

        return res.json({messages: results.rows})
    } catch (error) {
        return next(error)
    }
});


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get('/:username/from', async (req, res, next) => {
    try {
        const {username} = req.params
        const results = await User.messagesFrom(username)

        if (results.rows === 0) {
            throw new ExpressError('No messages from this user', 404)
        }

        return res.json({messages: results.rows})
    } catch (error) {
        return next(error)
    }
})