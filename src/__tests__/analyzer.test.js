import { analyzeData } from "../services/analyzer";
import { mockNotes } from "../test-utils/mockNotes";

describe("Analyzer Tests", () => {
  test("analyzeData should return correct stats", () => {
    const result = analyzeData(mockNotes);

    // 测试基础统计
    expect(result.stats.totalNotes).toBe(3);
    expect(result.stats.videoCount).toBe(1);
    expect(result.stats.imageCount).toBe(2);
    expect(result.stats.avgLikes).toBeCloseTo(2600.67, 1);

    // 测试标题分析
    expect(result.titleAnalysis.avgLength).toBeGreaterThan(0);
    expect(result.titleAnalysis.patterns.hasNumber).toBeCloseTo(33.33, 2);
    expect(result.titleAnalysis.patterns.hasEmoji).toBeCloseTo(66.67, 2);
  });

  test("analyzeData should handle empty data", () => {
    const result = analyzeData([]);

    expect(result.stats.totalNotes).toBe(0);
    expect(result.stats.avgLikes).toBe(0);
    expect(result.stats.videoCount).toBe(0);
    expect(result.stats.imageCount).toBe(0);

    expect(result.titleAnalysis.avgLength).toBe(0);
    expect(result.titleAnalysis.patterns.hasNumber).toBe(0);
    expect(result.titleAnalysis.patterns.hasEmoji).toBe(0);
  });

  test("analyzeData should handle invalid data", () => {
    const result = analyzeData(null);

    expect(result.stats.totalNotes).toBe(0);
    expect(result.stats.avgLikes).toBe(0);
    expect(result.stats.videoCount).toBe(0);
    expect(result.stats.imageCount).toBe(0);

    expect(result.titleAnalysis.avgLength).toBe(0);
    expect(result.titleAnalysis.patterns.hasNumber).toBe(0);
    expect(result.titleAnalysis.patterns.hasEmoji).toBe(0);
  });
});
