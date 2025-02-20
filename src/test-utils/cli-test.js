import { analyzeData } from "../../services/analyzer";
import { mockNotes } from "./mockNotes";

// 运行分析
const result = analyzeData(mockNotes);

// 打印结果
console.log("Analysis Result:");
console.log(JSON.stringify(result, null, 2));
