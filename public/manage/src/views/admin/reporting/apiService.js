import { dummyUsers } from "./dummyReportData";

let users = [...dummyUsers]; // local mutable copy

const delay = (ms) => new Promise(res => setTimeout(res, ms));

const apiService = {

  getAllUsersWithAuthorities: async () => {
    await delay(500);
    return { data: users };
  },

  // get users api
  getUserAuthorities: async (user_id) => {
    await delay(300);
    const user = users.find(u => u.id === user_id);
    return { data: user?.reportingAuthorities || [] };
  },

  // add authority api
  assignAuthority: async (user_id, authorityId) => {
    await delay(300);

    const user = users.find(u => u.id === user_id);
    const authority = users.find(u => u.id === authorityId);

    if (!user || !authority) throw new Error("Invalid user");

    user.reportingAuthorities.push({
      id: authority.id,
      name: authority.name,
      department: authority.department,
      designation: authority.designation
    });

    return { success: true };
  },

  // delete api
  deleteAuthority: async (user_id, authorityId) => {
    await delay(300);

    const user = users.find(u => u.id === user_id);
    user.reportingAuthorities = user.reportingAuthorities.filter(
      auth => auth.id !== authorityId
    );

    return { success: true };
  },

  // update  api
  updateAuthority: async (user_id, oldAuthorityId, newAuthorityId) => {
    await delay(300); // simulate API delay
  
    const user = users.find(u => u.id === user_id);
    const newAuthority = users.find(u => u.id === newAuthorityId);
  
    if (!user) {
      throw new Error("User not found");
    }
  
    if (!newAuthority) {
      throw new Error("New authority not found");
    }
  
    // Replace the old authority with new one
    user.reportingAuthorities = user.reportingAuthorities.map(auth =>
      auth.id === oldAuthorityId
        ? {
            id: newAuthority.id,
            name: newAuthority.name,
            department: newAuthority.department,
            designation: newAuthority.designation,
          }
        : auth
    );
  
    return { success: true };
  },

};

export default apiService;