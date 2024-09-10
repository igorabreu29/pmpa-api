import fs from 'node:fs'
import xlsx, { set_fs, utils, readFile, writeFile } from "xlsx";

set_fs(fs)

export {
  xlsx,
  utils,
  readFile,
  writeFile
}