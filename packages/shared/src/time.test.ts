import { propertyDate, toPropertyInstant } from "./time";

describe("toPropertyInstant", () => {
  it("Europe/Kyiv на літньому часі: UTC+3", () => {
    expect(toPropertyInstant("2026-10-04", "15:00:00", "Europe/Kyiv").toISOString()).toBe(
      "2026-10-04T12:00:00.000Z",
    );
  });

  it("Europe/Kyiv після переходу на зимовий час 25.10: UTC+2", () => {
    expect(toPropertyInstant("2026-10-26", "15:00:00", "Europe/Kyiv").toISOString()).toBe(
      "2026-10-26T13:00:00.000Z",
    );
  });

  it("America/New_York у жовтні: UTC−4", () => {
    expect(toPropertyInstant("2026-10-04", "16:00:00", "America/New_York").toISOString()).toBe(
      "2026-10-04T20:00:00.000Z",
    );
  });

  it("некоректний пояс — помилка", () => {
    expect(() => toPropertyInstant("2026-10-04", "15:00:00", "Mars/Olympus")).toThrow(RangeError);
  });
});

describe("propertyDate", () => {
  it("дата рахується в поясі об'єкта, а не в UTC", () => {
    // 23:30 UTC 03.10 — у Києві вже 04.10
    const now = new Date("2026-10-03T23:30:00Z");
    expect(propertyDate("Europe/Kyiv", 0, now)).toBe("2026-10-04");
    expect(propertyDate("America/New_York", 10, now)).toBe("2026-10-13");
  });
});
