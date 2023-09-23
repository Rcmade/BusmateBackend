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

    </style>
  </head>
  <body>
   <p>${error}</p>
  </body>
</html>

`;
};

module.exports = ErrorEmailTemplate;
