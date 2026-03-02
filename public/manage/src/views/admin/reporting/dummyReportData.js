export const dummyUsers = [
    {
      id: 1,
      name: "Anant  khanekar",
      role: "Admin",
      roleId: 1,
      department: "Management",
      designation: "Head of Operations",
      reportingAuthorities: []
    },
    {
      id: 2,
      name: "Tushar kutre",
      role: "Beta",
      roleId: 2,
      department: "Engineering",
      designation: "Frontend Developer",
      reportingAuthorities: [
        {
          id: 4,
          name: "Radhika Sawant",
          department: "Engineering",
          designation: "Product Manager"
        }
      ]
    },
    {
      id: 3,
      name: "Shubham Chavan",
      role: "Beta",
      roleId: 2,
      department: "Engineering",
      designation: "Backend Developer",
      reportingAuthorities: [
        {
          id: 4,
          name: "Radhika Sawant",
          department: "Engineering",
          designation: "Product Manager"
        },
        {
          id: 5,
          name: "Anil Lohar",
          department: "Engineering",
          designation: "Tech Lead"
        }
      ]
    },
    {
      id: 4,
      name: "Radhika Sawant",
      role: "Admin",
      roleId: 1,
      department: "Engineering",
      designation: "Engineering Manager",
      reportingAuthorities: []
    },
    {
      id: 5,
      name: "Sai herekar",
      role: "Admin",
      roleId: 1,
      department: "Engineering",
      designation: "Tech Lead",
      reportingAuthorities: [
        {
          id: 6,
          name: "Radhika Sawant",
          department: "Engineering",
          designation: "Product Manager"
        },
        {
          id: 7,
          name: "Anil Lohar",
          department: "Engineering",
          designation: "Tech Lead"
        }
      ]
    }
  ];