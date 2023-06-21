export const getUsernameFromArgs = () => {
  const USERNAME_FLAG = "--username";
  const userNameStr = process.argv.find((arg) => arg.includes("--username"));
  if (userNameStr) {
    return userNameStr.split("=")[1];
  }
  throw new Error("You should pass username as argument");
};

export const sortFiles = (files) => {
  return files
    .map((file) => {
      const fileType = file.isDirectory() ? "Directory" : "File";
      return {
        name: file.name,
        type: fileType,
      };
    })
    .sort((a, b) => {
      if (a.type === "Directory" && b.type === "File") {
        return -1;
      } else if (a.type === "File" && b.type === "Directory") {
        return 1;
      } else {
        return a.name.localeCompare(b.name);
      }
    });
};
