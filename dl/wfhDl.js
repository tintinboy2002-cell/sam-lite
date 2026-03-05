const { isEmpty } = require("lodash");
var mysqlDao = require(__base + "/dao/mysqlDao");
global._ = require("lodash");

function obj() {
  //add new wfhrequest(post)
  this.addWfhRequest = async function (obj) {
    const query = `insert into sam_wfhrequest (user_id, org_id, request_type, start_date, end_date, 
        days, status, applied_on,reason, created_by, updated_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      obj.user_id,
      obj.org_id,
      obj.request_type,
      obj.start_date,
      obj.end_date,
      obj.days,
      obj.status,
      obj.applied_on || new Date(),
      obj.reason,
      obj.created_by,
      obj.updated_by,
    ];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  //get(admin)
  this.getAdminWfhRequest = async function () {
    const query = `select w.request_type , w.id, u.employee_id, u.username, w.start_date, w.end_date,
                       w.days, w.status, w.reason, w.applied_on from sam_wfhrequest as w
                       left join sam_users as u on w.user_id = u.id;`;
    let res = await mysqlDao.doQuery(query);
    return _.isEmpty(res) ? {} : res;
  };

  //get(specific user)
  this.getWfhRequest = async function (user_id) {
    const query = `select * from sam_wfhrequest where user_id = ?`;
    let res = await mysqlDao.doQueryParams(query, [user_id]);
    return _.isEmpty(res) ? {} : res;
  };

  //put(update edit)
  this.editWfhRequest = async function (obj) {
    const query = `update sam_wfhrequest set reason = ?,  start_date = ?, end_date = ?
                        where id = ? and status = 'Pending';`;
    const values = [obj.reason, obj.start_date, obj.end_date, obj.id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  //delete api
  this.removeWfhRequest = async function (data) {
    let ids = Array.isArray(data.id) ? data.id : [data.id]; // wrap single id in array
    const query = `DELETE FROM sam_wfhrequest WHERE id IN (?);`;
    const res = await mysqlDao.doQueryParams(query, [ids]);
    return _.isEmpty(res) ? {} : res;
  };

  //update api approve/reject for admin
  this.updateWfhRequestStatus = async function (obj) {
    const query = `update sam_wfhrequest set status = ? where id = ?`;
    const values = [obj.status, obj.id];
    const res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };
}
module.exports = new obj();
