var mysqlDao = require(__base + "/dao/mysqlDao.js");

function obj() {
  this.addHoliday = async function (id, obj) {
    const query = `Insert into holiday_calender(org_id, holiday_description,  Date, image, body_description, holiday_subject) values(?,?,?,?,?,?)`;
    let values = [
      id,
      obj.holiday_description,
      obj.holiday_date,
      obj.image,
      obj.body_description,
      obj.holiday_subject,
    ];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.updateHoliday = async function (org_id, data) {
    let query = `
    UPDATE holiday_calender
    SET holiday_description = ?,
        date = ?,
        body_description = ?,
        holiday_subject = ?
  `;

    let values = [
      data.holiday_description,
      data.holiday_date,
      data.body_description,
      data.holiday_subject,
    ];

    // Only update image if it is coming
    if (data.image) {
      query += `, image = ?`;
      values.push(data.image);
    }

    query += ` WHERE id = ? AND org_id = ?`;
    values.push(data.id, org_id);

    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getHolidays = async function (id) {
    const query = `select * from holiday_calender where org_id=? and year(date) = year(curdate()) order by date asc`;
    let values = [id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.deleteHolidays = async function (data) {
    const query = `delete from holiday_calender where org_id=? and id=?`;
    let values = [data.org_id, data.holiday_Id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.checkHoliday = async function (id, data) {
    const query = `select*from holiday_calender where org_id=? AND  date=?;`;
    let values = [id, data.holiday_date];
    let res = await mysqlDao.doQueryParams(query, values);
    console.log(res, "response");
    return _.isEmpty(res) ? {} : res;
  };
}

module.exports = new obj();
