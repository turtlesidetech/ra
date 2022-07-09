export const connection = async (page: any) => {
  await page.goto("https://ra.solutions30.com");
  await page.fill("#user", `${process.env.RA_USER}`);
  await page.fill("#pass", `${process.env.RA_PASSWORD}`);
  await page.click(".btn-default");
  await page.click(".navbar-left");
};

export const getWeekData = async (page: any, week: any, year: any) => {
  await page.goto(
    `https://ra.solutions30.com/recap_tech.php?w=${week}&y=${year}`
  );
  await page.waitForFunction(() => {
    const table = document.querySelectorAll("#recap");
    return table.length === 1;
  });

  const table = await page.$$eval("#recap", (table: any) => {
    const formatData = (data: any) => {
      const z = data.split("\t");

      const final = {
        depart: z[1],
        debutM: z[2],
        finM: z[3],
        debutAM: z[4],
        finAM: z[5],
        retour: z[6],
        nbHeures: z[7],
      };

      return final;
    };

    const t = table[0];

    const bodyRow = t.querySelectorAll("tbody tr");
    const keys = Object.keys(bodyRow);

    const bodyRowsArray = keys.map((key) => {
      return bodyRow[key];
    });
    const supervisorData = bodyRowsArray.filter(
      (row, index) => index % 3 === 2
    );

    return supervisorData.map((d) => {
      return formatData(d.innerText);
    });
  });

  const supervisorHour = await page.$$eval("#dvData", (c: any) => {
    const rows = c[0].querySelectorAll("div.row");

    const t = rows[1].innerText.split("\n");

    return {
      pc30: t[1],
      tech: t[2],
      supervisor: t[3],
    };
  });

  return {
    week,
    year,
    data: table,
    supervisorHour: supervisorHour,
  };
};
