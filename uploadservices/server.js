const app = require("./src/app");
const prisma = require("./src/prisma");
const port = process.env.PORT || 3056;
const hostname = "0.0.0.0";

async function main() {}
const server = app.listen(port, hostname, () => {
  console.log(`Hello at`, port);
  main()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
});
