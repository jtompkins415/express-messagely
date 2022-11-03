/** User class for message.ly */

const { DB_URI } = require("../config");
const bcrypt = require('bcrypt');
const ExpressError = require('../expressError');
const { BCRYPT_WORK_FACTOR } = require('../config');
const res = require("express/lib/response");



/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */
 
  
  static async register({username, password, first_name, last_name, phone}) {
      const {username, password, first_name, last_name, phone} = req.body
      const hashedPwd = bcrypt.hash(password, BCRYPT_WORK_FACTOR) 
      const result = await db.query('INSERT INTO users (username, password, first_name, last_name, phone) VALUES ($1, $2, $3, $4, $5) RETURNING username, password, first_name, last_name, phone', [username, hashedPwd, first_name, last_name, phone]);

      user = result.rows[0];

      return res.json({user})
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) { 
      const results = await db.query('SELECT username, password FROM users WHERE username=$1', [username]);
      const user = results.rows[0];
      if (user){
        if (await bcrypt.compare(password, user.password)){
          return true
        } else {
          throw new ExpressError('Invalid Username/Password', 400)
        };
      };
  };

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { 
      const results = await db.query('UPDATE users SET last_login_at = current_timestamp WHERE username = $1 RETURNING username, last_login_at', [username]);

      if(!results.rows[0]){
        throw new ExpressError(`User: ${username} not found`, 404);
      };

       return results.rows[0]

  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 
    const results = await db.query('SELECT username, first_name, last_name, phone FROM users WHERE username=$1', [username]);

    if(!results.rows[0]){
      throw new ExpressError(`User: ${username} not found`, 404);
    };

    return results.rows[0];
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const results = await db.query('SELECT username, first_name, last_name, phone, join_at, last_login_at FROM users WHERE username=$1', [username]);

    
    if(!results.rows[0]){
      throw new ExpressError(`User: ${username} not found`, 404);
    };
    
    return results.rows[0];
  };

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { 
    const results = await db.query('SELECT m.id, m.from_username, m.to_username, t.first_name AS to_first_name, t.last_name AS to_last_name, t.phone AS to_phone, m.body, m.sent_at, m.read_at FROM messages as m JOIN users AS f ON m.from_username = f.username JOIN users AS t ON m.to_username = t.username WHERE m.from_username = $1', [username]);

    const messages = results.rows[0]

    return {
      id: messages.id,
      to_user: {
        username: messages.to_username,
        first_name: messages.to_first_name,
        last_name: messages.to_last_name,
        phone: messages.to_phone
      },
      body: messages.body,
      sent_at: messsages.sent_at,
      read_at: messages.read_at
    }
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) { }
}


module.exports = User;