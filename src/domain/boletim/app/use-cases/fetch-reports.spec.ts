import { InMemoryReportsRepository } from "test/repositories/in-memory-reports-repository.ts";
import { beforeEach, describe, it } from "vitest";
import { FetchReportsUseCase } from "./fetch-reports.ts";
import { makeReport } from "test/factories/make-report.ts";

let reportsRepository: InMemoryReportsRepository
let sut: FetchReportsUseCase

describe('Fetch Reports Use Case', () => {
  beforeEach(() => {
    reportsRepository = new InMemoryReportsRepository()
    sut = new FetchReportsUseCase(
      reportsRepository
    )
  })

  it ('should be able to fetch reports', async () => {
    reportsRepository.create(makeReport())
    reportsRepository.create(makeReport())
  })
})