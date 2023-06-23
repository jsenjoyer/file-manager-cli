export const getUsernameFromArgs = () => {
  const USERNAME_FLAG = "--username";
  const userNameStr = process.argv.find((arg) => arg.includes(USERNAME_FLAG));
  if (userNameStr) {
    return userNameStr.split("=")[1];
  }
  throw new Error("You should pass username as argument");
};

export const sortFiles = (files) => {
  return files
    .map((file) => {
      const fileType = file.isDirectory() ? "directory" : "file";
      return {
        name: file.name,
        type: fileType,
      };
    })
    .sort((a, b) => {
      if (a.type === "directory" && b.type === "file") {
        return -1;
      } else if (a.type === "file" && b.type === "directory") {
        return 1;
      } else {
        return a.name.localeCompare(b.name);
      }
    });
};
