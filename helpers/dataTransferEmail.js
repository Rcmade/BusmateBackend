const dataTransferEmail = (data) => {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Monthly Report</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        margin: 0;
        padding: 0;
      }

      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f7f7f7;
      }

      .header {
        background-color: #2d2c2f;
        padding: 20px;
        text-align: center;
        color: #fff;
      }

      .header h1 {
        margin: 0;
        font-size: 24px;
      }

      .content {
        padding: 20px;
        background-color: #fff;
      }

      .section {
        margin-bottom: 20px;
      }

      .section h2 {
        font-size: 20px;
        margin-bottom: 9px;
      }

      .section p {
        margin: 0;
        color: #0a12ff;
        font-size: 1.2rem;
      }

      .footer {
        padding: 20px;
        background-color: #000;
        text-align: center;
        color: #fff;
      }

      .footer p {
        margin: 0;
        font-size: 12px;
      }

      .footer img {
        max-width: 80px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>DataBase Report</h1>
      </div>
      <div class="content">
        <div class="section">
          <h2>Total Inserted User In Backup Database</h2>
          <p>${data?.insertedUser}</p>
        </div>
        <div class="section">
          <h2>Total Deleted Documents from Real-Time Location</h2>
          <p>${data?.totalDeletedDocumentFrom_RealTimeLocation}</p>
        </div>
        <div class="section">
          <h2>Total Delete[











    
  {
    inputValue: {
      busNumber: null,
      email: "deepakyuvasoft305@gmail.com",
      familyName: "chourasiya",
      givenName: "deepak",
      id: "117637037298108861645",
      idCard: null,
      idToken:
        "eyJhbGciOiJSUzI1NiIsImtpZCI6IjZmNzI1NDEwMWY1NmU0MWNmMzVjOTkyNmRlODRhMmQ1NTJiNGM2ZjEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI5NjI2MzEzODIzNy1jOWFoNm5ta2ZqbWVzamloamppM2JjbzFhaTV1aDRvYi5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImF1ZCI6Ijk2MjYzMTM4MjM3LWk0b3Mwa3A1dnRybGN1dmRhdjN2aG5lZmhxdHM2NTYyLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTE3NjM3MDM3Mjk4MTA4ODYxNjQ1IiwiZW1haWwiOiJkZWVwYWt5dXZhc29mdDMwNUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6ImRlZXBhayBjaG91cmFzaXlhIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0pOYy0zRnhPdlR1MmozOTdwNFBNWUhfN0c1b1MzQWdNU3MybFBUSzEzWkZRPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6ImRlZXBhayIsImZhbWlseV9uYW1lIjoiY2hvdXJhc2l5YSIsImxvY2FsZSI6ImVuLUdCIiwiaWF0IjoxNjk1MzkxNTYxLCJleHAiOjE2OTUzOTUxNjF9.G0K98m5xFv_ONgr-hocPvceyuhVJg5YWfysFooQf1iV6-Etg4cmS0AqHmHmKAW1VxCY2cSqMBwR9Hyw5BSrFfK0D81aV_Ym5RCWGZrg1qntMX27Q2ppWGQ6D-9WQL_bB0H0WUxdBhR_td2qxDGeUqbqEYvI14HAj-VMbubN2vGDRDQTQTg64L41rwFDzAA_d9Z_rhzjMtgE0CtIVPlVZer-do8UERYqcVMJwiWsCjN1hbFsMevX0zEbhaTr3IrDLOPqMeYqs-mEfvk39OXetyn5CXrPJ_pwFx0rRYJJqGeQgZRv11lgfckqhWD3YWUGS8-Hw1cDSA0V3pCDAP3YiKw",
      name: "deepak chourasiya",
      password: null,
      photo:
        "https://lh3.googleusercontent.com/a/ACg8ocJNc-3FxOvTu2j397p4PMYH_7G5oS3AgMSs2lPTK13ZFQ=s96-c",
      profileImage:
        "file:///data/user/0/com.busmate/cache/Camera/16cfe614-09da-4d46-809d-a931f2a8a7ea.jpg",
    },
  },
];
d Documents from Current Contributor</h2>
          <p>${data?.totalDeletedDocumentFrom_CurrentContributor}</p>
        </div>
        <div class="section">
          <h2>Inserted Real-Time Locations in Last Five Days</h2>
          <p>${data?.insertedRealtimeInFiveDaysLocation}</p>
        </div>
        <div class="section">
          <h2>Total Deleted Documents from Last Five Days of Location</h2>
          <p>${data?.totalDeletedDocumentFrom_FiveDaysOfLocation}</p>
        </div>
      </div>
      <div class="footer">
        <img
          src="https://res.cloudinary.com/du1fpl9ph/image/upload/v1686144628/BusmateTransparent512_512Logo_ugiflk.png"
          alt="Company Logo"
        />
        <p>&copy; 2023 Company Name. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>

`;
};

module.exports = dataTransferEmail;
