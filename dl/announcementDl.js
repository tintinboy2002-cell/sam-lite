var mysqlDao = require(__base + "/dao/mysqlDao");
global._ = require("lodash");
const cron = require('node-cron');

function obj() {

    //Announcement API start here
    //get token
    this.findFcmToken = async function () {
        const query = ` SELECT * FROM sam_users_device_tokens; `;
        let res = await mysqlDao.doQuery(query);
        return _.isEmpty(res) ? {} : res;
    };

    //delete token by user_id and device_name
    // this.deleteDeviceToken = async function (user_id, device_type) {
    //   let query = `delete from sam_users_device_tokens where user_id=? and device_type= ?  ;`
    //   let value = [user_id, device_type];
    //   let res = await mysqlDao.doQueryParams(query, value);
    //   return _.isEmpty(res) || !_.isEmpty(res.sql) ? {} : res;
    // };

    //auto  updating announcemnet after 2 days using cron
    cron.schedule('0 * * * *', async () => {
        try {
            console.log('⏳ Checking for expired announcements...');

            const query = `
                    UPDATE sam_announcement
                    SET status = 'Expired'
                    WHERE status = 'Active'
                    AND created_date <= NOW() - INTERVAL 2 DAY;
                  `;
            const result = await mysqlDao.doQuery(query);

            console.log(`Expired announcements updated: ${result.affectedRows || 0}`);
        } catch (err) {
            console.error('Cron job error:', err);
        }
    });

    //get all announcement
    this.getAllAnnouncement = async function () {
        const query = ` select announcement_id, title, message,created_by, attachment_url, start_date, end_date, status,created_date from sam_announcement ;`
        let res = await mysqlDao.doQuery(query);
        return _.isEmpty(res) ? {} : res;
    }

    //create or add Announcemnet
    this.addAnnouncement = async function (username, obj) {
        const query = `
          INSERT INTO sam_announcement (title, message, attachment_url, attachment_buffer, created_by, start_date, end_date)
          VALUES (?,?,?,?,?,?,?)
          `;
        let values = [obj.title, obj.message, obj.attachment_url, obj.attachment_buffer, username, obj.start_date, obj.end_date];
        let res = await mysqlDao.doQueryParams(query, values);
        return global._.isEmpty(res) ? {} : res;
    }

    //update Announcemnet
    this.updatedAnnouncement = async function (announcement_id, updateData) {
        const updateFields = [];
        const values = [];

        for (let key in updateData) {
            if (updateData[key] === undefined) continue;

            if (typeof updateData[key] === "object" && updateData[key] !== null) {
                updateFields.push(`${key} = ?`);
                values.push(JSON.stringify(updateData[key]));
            } else {
                updateFields.push(`${key} = ?`);
                values.push(updateData[key]);
            }
        }
        if (updateFields.length === 0) return { affectedRows: 0 };

        const query = `
                update sam_announcement
                SET ${updateFields.join(", ")}
                WHERE announcement_id = ?
            `;
        values.push(announcement_id);

        const res = await mysqlDao.doQueryParams(query, values);
        return res;


    }

    //delete Announcement
    this.deleteAnnouncement = async function (obj) {
        let query = `delete from sam_announcement where announcement_id=? ;`;
        let value = [obj.announcement_id];
        let res = await mysqlDao.doQueryParams(query, value);
        return _.isEmpty(res) || !_.isEmpty(res.sql) ? {} : res;
    }

    //download announcement file
    this.downloadAnnouncement = async function (obj) {
        let query = `select attachment_url, attachment_buffer from sam_announcement where announcement_id=?`
        let value = [obj.announcement_id];
        let res = await mysqlDao.doQueryParams(query, value);
        return _.isEmpty(res) || !_.isEmpty(res.sql) ? {} : res;
    }
    //Announcement API End here

}

module.exports = new obj();
