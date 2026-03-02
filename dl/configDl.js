var mysqlDao = require(__base + "/dao/mysqlDao");

function obj() {
  this.isRoleExist = async function (data) {
    let query = "";
    let values = [];

    if (data.role_id) {
      query = `SELECT * FROM sam_roles WHERE role_id = ?`;
      values = [data.role_id];
    } else if (data.role_name) {
      query = `SELECT * FROM sam_roles WHERE role_name = ?`;
      values = [data.role_name];
    }

    let res = await mysqlDao.doQueryParams(query, values);

    return _.isEmpty(res) || !_.isEmpty(res.sql) ? {} : res[0];
  };

  this.createRole = async (obj) => {
    const query = `INSERT INTO sam_roles
    (role_name,
     org_id,
    description)
    VALUES
    (?,
    ?,
    ?);`;
    let values = [obj.role_name, obj.org_id, obj.description];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.getRoles = async function (org_id) {
    const query = `
        SELECT *
        FROM sam_roles
        WHERE org_id = ?
    `;
    let res = await mysqlDao.doQueryParams(query, org_id);
    return global._.isEmpty(res) ? {} : res;
  };

  this.updateRole = async (obj) => {
    const query = `UPDATE sam_roles
	SET
	role_name = ?,
    description = ?
	WHERE org_id = ? and role_id = ?;`;
    let values = [obj.role_name, obj.description, obj.org_id, obj.role_id];
    let res = await mysqlDao.doQueryParams(query, values);
    return _.isEmpty(res) ? {} : res;
  };

  this.deleteRole = async (obj) => {
    let query = `DELETE FROM sam_roles
      WHERE role_id = ? and org_id= ?;`;
    let value = [obj.role_id, obj.org_id];
    let res = await mysqlDao.doQueryParams(query, value);
    return global._.isEmpty(res) ? {} : res;
  };
}

module.exports = new obj();
