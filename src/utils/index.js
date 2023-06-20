export const getUsernameFromArgs = () => {
  const USERNAME_FLAG = "--username";
  const userNameStr = process.argv.find((arg) => arg.includes("--username"));
  if (userNameStr) {
    return userNameStr.split("=")[1];
  }
  throw new Error("You should pass username as argument");
};
