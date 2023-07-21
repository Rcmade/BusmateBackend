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
          <h2>Total Deleted Documents from Current Contributor</h2>
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
