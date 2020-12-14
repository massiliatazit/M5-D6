const { writeJSON, readJSON } = require("fs-extra");
const readDB = async (File_Path) => {
    //read from disk
  try {
      const fileJsonies = await readJSON(File_Path)
      return fileJsonies
  }catch(err){
      throw new Error(err)
  }
};
const writeDB = async (File_Path,data)=>{
//writing on disk
    try{
        await writeJSON(File_Path,data)
    }catch(err){
        throw new Error (err)
    }
}

module.exports={readDB,writeDB}