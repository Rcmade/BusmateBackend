const ErrorEmailTemplate = (error) => {
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
   <p>${error}</p>
  </body>
</html>

`;
};

module.exports = ErrorEmailTemplate;
