// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import playwright from "playwright";
import { connection, getWeekData } from "../../domain/service";

type Data = {};

type DataError = {
  error: string;
};

type RequestData = {
  weeks: number[];
  year: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | DataError>
) {
  const body = req.body;

  const { weeks, year } = body as RequestData;

  if (weeks === undefined || year === undefined) {
    res.status(404).json({ error: "Missing weeks or year" });
    return;
  }

  if (weeks.length > 5) {
    res.status(404).json({ error: "Too many weeks" });
    return;
  }
  if (weeks.length === 0) {
    res.status(404).json({ error: "Missing weeks" });
    return;
  }

  if (year.toString().length !== 4) {
    res.status(404).json({ error: "Invalid year" });
    return;
  }

  const browser = await playwright.chromium.launch({ headless: true });
  const page = await browser.newPage();
  await connection(page);
  const data = [];
  for (let i = 0; i < weeks.length; i++) {
    let d = await getWeekData(page, weeks[i], 2022);
    data.push(d);
  }

  res.status(200).json(data);
}
