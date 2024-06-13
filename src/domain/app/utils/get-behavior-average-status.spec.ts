import { describe, expect, it } from "vitest";
import { getBehaviorAverageStatus } from "./get-behavior-average-status.ts";

describe('Behavior Average Status', () => {
  it ('should be able to receive approved if the average is greater than 6 and less than 10', () => {
    const behaviorAverageStatus = getBehaviorAverageStatus(8)

    expect(behaviorAverageStatus.status).toEqual('approved')
    expect(behaviorAverageStatus.behaviorAverage).toEqual(8)
  })

  it ('should be able to receive disapproved if the average is less than 6', () => {
    const behaviorAverageStatus = getBehaviorAverageStatus(5.5)

    expect(behaviorAverageStatus.status).toEqual('disapproved')
    expect(behaviorAverageStatus.behaviorAverage).toEqual(5.5)
  })
})