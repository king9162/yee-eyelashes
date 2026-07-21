// Run: node scripts/import-clients.mjs
// Inserts new clients via the deployed API

const API_BASE = "https://yeeeyelashes.com/api/clients";
const ADMIN_KEY = "1125";

const raw = `Clara Zhang	6468532013	3D doll D10-12 point D13-14 140pc
Clendes John Moldero	3479043112	Canellia doll B11 70pc
Cindy Zhang	9175305218	Camellia nat B11 90pc point B11-12
Chloe Zheng	6468757770	Camellia doll c10 70pc
Cindy Canales	5169570075	lash lift
Christina Peng	6463276669	3D cat d9-12 140pc
Christina Luboja	5164562999	Camellia nat B10 70pc
Cheryl Charles	5169936811	lash lift&tint
Cecilia Chog	9176053231	3D cat C9-12 140pc
Cathy NG	7189158121	Mink cat b9-11 70pc自然
Caroline Rodriguez	7186004985	Camellia B9-11 90pc 自然
Carisa Kuo	9175332548	Camellia nat C10 70pc 自然
Carina Fung	9174822408	lash lift
Christina Szeto	6462262200	3D cat B8-11 140pc 自然
Cherry Huang	7184154001	Camellia nat B9 90pc 自然
Donna Koo	9175183384	Camellia cat C9-12 70pc 自然
Gloria Grullon	9178221482	Camellia doll B10 70PC
Gloria Genebroso	3472564743	mink cat C13 90pc
Gina Park	6469456254	3D wispy doll D9-11 point D13-15 140pc
Gina Dejesun	6464048990	Camellia nat D12 90pc 自然
Genny Romero	5164990737	Mink nat B10 70pc 自然
Gabriella Palma	9178644433	lash lift&tint
Grace Park	7189383304	lash lift
Kathy Iorio	5163191041	Camellia nat C9 70pc
Mirne Herrera	5162861541	Camellia cat D9-11 90pc
Kathy Panaro	7187728980	lash lift&tint
Kuo Ping	9178389746	3D nat b9-10 140pc
Kimberly Sancher	9173650674	3D cat C13 140pc
Kathy Xu	9177805721	Camellia nat B9 70pc
Kathy Zou	6264257078	3D doll C13 140pc满
Katrina Hernandez	5169652449	3D doll C12 140pc
Kathy PI	9174952129	Camellia nat b8 70pc
Kelly Gatanas	9177570002	3D nat B11 140pc
Kerri Kissane	5167543840	3D nat B8-9
Katia Hoffrnan	5162790237	Camellia cat b10 自然
Kristen Reyes	3476146958	3D doll C10-12 point c12-14 140pc
Klaum Kiera	5166808356	lash lift&tint
Karen Breen	5166520481	Camellia nat B9 90pc
Kat Colato	5166662494	3D cat C10-12 mix13 point 14-15 140pc
Kathryn Auriemma	5164281181	lash lift&tint
Aylie Zhou	6312028215	3D doll C10-11 point C12-14 泰式
Aslam Raziya	5166147964	Camellia nat B10 70pc自然
Ashley Pacheco	3472379339	3D B8-10 point B13-15 140pc
Ashley Jourden	5166474511	lash lift&tint
Arwa Ali	5166615383	lash lift&tint
Aliacia NG	9178683810	3D cat B9-11 point B12-14 140pc 八点定位不要太满
Ardeania Clark	2482294853	Camellia cat C9-12 90pc
Annenarie Devivo	5164595671	3D nat B10 140pc
Anna Sshargani	5129911416	lash lift&tint
Anna Cheung	5169888592	Camellia doll C10 90pc
Ann Zheng	2153561098	3D cat B8-9 point B10-12 140pc
Anastasia Visich	6316803602	lash lift&tint
Anastasia Gotenas	9293693415	3D cat B8-11 90pc 自然
Anais Vortanion	8186538277
Amy Shapira	5163536284	Camellia nat B9 90pc
Amy Grossman	5166627197	Camellia doll B10 70pc
Alysha Diaz	3477839427	3D cat B13 140pc
Alli Rothnan	9177447497	3D doll C12 140pc自然
Allza Misnra	6318737483	Mink cat B13 70pc
Alice Vchiyama	5163958759	Cashmere doll B10 70pc
Alian Esther	5165543488	3D cat C11 140pc
Alexandra Penzi	5165877241	lash lift&tint
Alexa Kava	5162361412	lash lift&tint
Ashley Rushell	6319487073	3D cat B9-12 point B13-14 140pc密
Ada Xie	6319949998	Camellia doll C8-10 point C10-12 90pc
Britteng Kalosza	7164001551	lash lift&tint
Brittany Farkouh	5162429748	Camellia doll D12 90pc非常自然
Briana Scarpa	5163060425	3D nat B8-10 自然
Bibi Doobay	6468416663	Camellia cat C10-13 110pc满
Bella Song	6173721487	3D B8-9 30-40pc point B10-12 20pc 140pc
Bella Fanelli	7189260168	Camellia nat B12 70pc
Baliene Woutersz	9175199604	Camellia nat B10 90pc
Brooke Krieger	6318965438	3D doll C12 140pc
Breann Hill	5083608884	Mink c12 point C14 70pc
Enida Brown	7186003916	3D nat B11-13 140pc自然
Emma Cruz	5164393872	Camellia Doll B10 90pc
Emily Muhistock	5166756500	lash lift&tint
Emily locker	5166031426	lash lift&tint
Emily Leventhal	5164138536	lash lift&tint
Emily Brandt	5169435175	3D doll C9-12 180pc
Elaine Cullen	6318278615	3D nat B11 140pc
Eileen Yen	9174689496	Cashmere cat B14 90pc
Evelyn Aioala	5165210251	Camellia nat b8 70pc自然
Farah Fenelon	5165825386	3D doll C9-12 point C12-14 140pc
Elisa	9177057804	Cshmere cat B11 70pc
Elizabeth Oladipo	3477224101	3D doll C10-12 point C13-15 140pc 九点定位
Elizebeth Salcoun	8312776090	3D doll B9-12 point B12-14
Ella Ledwith	5166678058	camellia nat C11 70pc
Emanuela Pattolo	5167805263	Camellia cat B11 90pc
Emelinda Vecchio	9172736772	Camellia nat B11 70pc
Emilsa Jeronimo	7185785728	lash lift&tint
Emma Wang	9179129963	Camellia Doll C9-10 point C11-12 90pc
Emily Bianco	5167742838	3D doll B10-11 point B12-14 140pc
Esraa Arafa	6467635142	3D doll D11-14 140pc满
Hindy Kadosh	9087839197	lash lift&tint
Henze Marvin	4154202438	Camellia doll B10 110pc
Heather Yu	7202241640	Camellia open B10 110pc
Hannah Ko	5164921328	3D doll B11-13 140pc
Hana Pappas	2017397420	lash lift&tint
Freya Feng	6464139880	3D doll D10 140pc 满
Fiona Wang	3473997543	3D DOLL c10-12 140pc
Farhat Chowdhury	9294055190	3D doll C10-12 point C13-15 140pc
Isys Morris	5162634423	3D nat B11 140pc 白嫖怪
Isadorah Victor	3477551665	3D C8-10 point C12-14
Isabella Martinaz	5166803868	3D cat B8-11 point B10-12 140pc
Isabella Liu	7186669744	Camellia doll B10 90pc
Isabella Chen	6313468669	3D C9-10mix11 point D13-14 140pc
Isabel Aislos	9294335963	3D cat B12 140pc
Iris Ore	5168173586	lash lift&tint
Iris Cai	5165267660	Camellia doll C9-11 point D13-14 70pc
Judy Tsai	5166619821	3D nat B11 140pc 不开花
Judy Mirharoon	5167881634	lash lift&tint
JuanJuan Zheng	9294108297	Camellia doll B8-10 point B11-12
Josephine Cho	5168169989	3D doll B12 140pc
Jocelyne Merlos	5166433560	Cashmere doll C10-12 70pc
Jocelyn Membreno	5167496871	3D cat C12 140pc
Jocelia Zabala	5168158353	Camellia doll B9-11 90pc 自然
Joanne Suen	9173612171	3D doll D10-13 140pc
Jisdy Portorred	9178914566	3D cat B13 180pc
Jillian Dilemme	5164924447	lash lift&tint
Jihan Corso	9175665276	Camellia cat C12 90pc
Jiaru Liu	3128262161	3D doll B9-11 自然
Jenny Kwon	9297331331	3D nat D11-13 140pc满
Jennifer You	3472212703	lash lift&tint
Jennifer Rianardson	7815343832	Camellia nat C11 90pc
Jennie Dai	9496179446	3D doll C10 point C13-14 140pc
Jennia Hakakian	5164844880	Cahmere cat B11 90pc
Jenna Marie	5165326927	lash lift&tint
Jenna Behar	5169657258	3D cat D12 140pc
Jasmin Meves	3478441581	lash lift&tint
Jane Qin	5168493803	Camellia cat D10 90pc
Jing Liu	9294290424	Camellia doll B8-10 point B10-11 140pc
Jacquia Jucean	9174060014	lash lift&tint
Jacklyn Kelly	3477210196	lash lift&tint
Kaclyn Carey	5163614331	Camellia cat C13 70pc
Jessica YI	6466230089	Cashmere nat B10 70pc
Jennifer Yi	6465847344	3D cat B12 140pc 自然
Jeliet Wan	3473287268	Camellia doll B10 90pc
Julie Diry	6126369650	3D doll B8-9 point B10-12 140pc
Julianna Schepanski	5166424466	3D doll C13 140pc
Julia Han	4259991043	Cashmere cat C12 70pc
Lina Chung	9179138870	3D doll C13 140pc
Lina Nelko	5164399971	3D cat C8-11 140pc
Lina Lejla	9292107054	3D cat mix doll C9-11 140pc
Lina Joo	6464316274	Camellia cat B8-10 90pc
Linda Nica	5164399973	Cahshmere cat B9-11 90pc
Ling Zheng	5168849328	3D doll C9-11 point C13-14 140pc
Lina Gormley	9177160804	Camellia nat D11 90pc
Linda Stampler	5163137149	Mink nat B10 70pc
Lily Latai	5166436416	3D doll C12 140pc
Laura Grazi	9173970216	lash lift&tint
Lisa Olives	9292246692	3D cat B10 140pc自然
Lilli Eimmerman	6313790089	lash lift&tint
Li Ye	6502248566	Camellia nat B19 70pc
Leslie Dominicci	2525786671	3D cat B9-12 point B12-14 140pc
Lenita Doobay	6468417695	3D cat C11-14 140pc
Lauren Tully	6463535394	lash lift
Laura Runcie	2017079372	Camellia cat B10 90pc
Laura Bhola	9175152872	lash lift&tint
Laura Gelb	9144331993	Camellia nat C11 70pc
Lauren Binenbaum	9175797636	Camellia cat B10 70pc
Lauren Margiotta	5164779435	lash lift+bottom lash
Lauren Peart	9143168983	3D cat B11 140pc
Laura Ciamiciam	9179517287	3D cat C11 180pc
Lauren Stipp	9175959939	Camellia cat B10 90pc自然
Morma Moledo	5163187125	lash lift&tint
Nora Bianco	5164593638	Camellia doll B8-9 point B11-12 110pc
Nicole Yan	9292188997	3D C10 mix C11 point doll B8 140pc
Nicole Pecora	7188014091	Camellia cat D13 110pc
Nicole Conway	5165028433	lash lift&tint
Nicki Geiger	5167245124	Mink doll C13 90pc
Natasha Castro	5165280799	Camellia doll C13 90pc
Natalia Lozada	7187515838	lash lift&tint
Nancy Chris	5166889275	Mink cat B8-10 70pc自然
Nicole Eiggle	5164620856	lash lift
O Fance Rania	6464134383	Camellia nat B11 110pc 自然
Orabhjot Dhaliwal	5167286184	Mink doll C10-12 70pc
Piya Baiaj	5167896718	Camellia doll C13 70pc
Phoenix	5179756286	Camellia doll B9 70pc
Paige Retracca	3036253017	3D nat B9 140pc
Patricia Papataros	9175092759	3D cat B8-13 140pc满非常猫眼
Qian Yang	6318820022	Cashmere nat B12 70pc
Rosmery Mendoza	6314312072	Camellia nat B11 70pc
Rivka Earifpoa	5166031444	Camellia nat B12 90pc自然
Reyueh Nadi	5162889660	3D cat B9-12非常猫眼
Raissa Petracca	5163303566	Camellia nat B9 70pc
Rachel	3473067848	Camellia nat B10 70pc自然
Ryan Petracca	5162637767	Camellia nat B11 90pc
Sabrina Roszro	5164573331	Cashmere nat B11 70pc 自然
Sabrina Tang	6463582435	3D doll B8-10 point B11-12 140pc
Sandeep Kavr	5167847520	3D cat B13 140pc 小花自然
Samdra Lang	9178172524	Camellia cat B10 70pc
Sydney Taduran	9177753716	3D cat C13 140pc满
Susie Chun	9175134145	Camellia cat B9-11 point C10-12 110pc
Susan Paulsen	5168498045	Cashmere nat B10 70pc自然
Sunny Lin	9176892488	Camellia doll C10-12 point D13-14 70pc
Stephanie Martine	3477243230	3D cat C10 140PC不开花
Stella Golia	3475850147	3D cat C14 180pc小开花
Stacey Giuffre	5163136109	3D doll C15 180pc满
Sophie Mason	5164230018	lash lift&tint
Sophia Stipp	5163293693	3D doll C13 140pc
Sophia Chen	9293199738	Camellia doll D10 70pc自然
Sonia Zheng	9173552539	Cashmere cat B11 90pc
Sonia Perez	9172511027	Mink cat C12 70pc
Sofia Villafane-Hirsch	9178218510	Camellia cat B10 70pc
Sirni Simrat Gill	5169746211	3D cat C10-13 140pc满
Sidra Khan	3472967264	lash lift&tint
Shueta Sonha	5516558616	waxing
Shinvani Mehta	7146790080	lash lift&tint
Serena Singh	3476046666	Camellia cat B12 90pc
Selina	9174426795	Camellia cat B9 90pc 自然
Sarah Lee	2018893198	3D doll D12 140pc 小花
Sandy Wang	9176357596	Camellia doll C10 point C11-12 110pc
Sydney Martin	5165780182	lash lift&tint
Tina Zhen	5165372002	lash lift
Tina Wei	5168589678	Camellia doll c10 70pc
Taylor Farkouh	5164770859	Mink nat C13 90pc
Tatyana Sinn	7324858218	3D cat B9-12 140pc不开花
Tammy NG	9176176763	Camellia doll C11 90pc
Tali	5165829226	Cashmere Doll C10-12 110pc
Tameka Olives	3475313429	3D C10-12 point C13-15 140pc
Vivian Lee	3476056436	Camellia doll B8-10 90pc 自然
Victoria Wang	5163889192	Camellia nat B10 70pc
Vanessa Li	7183620812	3D nat B10 140pc自然
Vivian Zeng	6467503138	3D doll C10 B8 9mix 140pc
Wynee Martinez	7184270035	3D cat B12 140pc
Winnie Weng	9294988596	Camellia cat B8-10 point B10-11自然
Wendy Zeng	6463791180	Camellia doll B11 point C12-14 110pc自然
Wendy Mei	9173628219	3D LB9-11 point D14-15 140pc
Yana Drand	6316179449	3D doll B11 180pc 大花
Yolanda Segura	9293208314	3D cat B10 140pc
Yasmin Delao	5166805820	lash lift&tint
Yuqing Jiao	2164074904	3D doll B8-9 point B9-12 140pc
Ximena Narvaez	5168708794	3D doll B12 140pc
Xiaoyue Zhang	6467278592	3D B7-10 point C11-14 140pc 狐系
Maria Cothdis	9177501543	3D nat C9-12 180pc 满
美乐Dai太太	5165786763	Camellia nat B9 70pc
Morren Whalley	7877738807	lash lift&tint
Moj Noor	3106223776	3D nat B10 140pc
Miayoung Hoggtgt	9177504718	Camellia nat B10 70pc
Melody Kang	5163504972	3D doll B10 140pc
Mia Liu	6314923339	3D doll C12-14 九点定位140pc
Millie Banegas	5167389101	3D doll C12 140pc
Mindy Dek	5166066186	3D nat D10-12 140pc
Mindy Lee	6462670073	3D cat C12 140pc
Miranda Kaur	5168526262	3D nat B11 140pc
Miriam Zarifpoa	6464040110	Camellia cat B11 90pc
Maria Mardareuch	5163308420	Camellia cat B8-11 90pc
Maria Marcodo	9175777087	lash lift&tint
Meli Chun	9176923445	3D cat C11-14 140pc
May Wong	6462872612	lash lift
Meiyen Yeh	5166609535	3D nat B9 140pc
May Lee	6464418023	Camellia doll C8-10 90pc
Marta Reilly	2123807553	3D doll C11 140pc 满
Mary Lepore	9178682685	lash lift&tint
Martina Tully	9176697926	lash lift
Marcia Thomas	3476816511	3D cat C12 180pc
Marta Gabrielli	5164913988	Camellia Cat B8-10 110pc
Marisa Chan	5167039550	lash lift
Marilyn Zallo	9178823436	Camellia cat B10 70pc
Mirielle Bruno	3479817928	3D nat C14 140pc
Mirtha Cifuentes	7188775860	Camellia nat B12 90pc
Mati Pearson	6467404938	Camellia doll C13 70pc
Minna Levy	3474268883	lash lift
Mesha	5162057934	3D doll D11-14 140pc
Mergaret Pace	5163199479	Camellia nat B9 90pc 自然
Maria Tapage	9174002113	3D doll D11-13 140pc
Danielle Siegel	3477490654	Cashmere doll C10-12 90pc 自然
Darian Hemando	5162054579	3D doll B10-11 mix point B11-13 140pc
Daisy Pimentel	6462882916	3D cat C10-12 point C13-15 180pc
Debbie Landskousky	5166613631	Camellia cat C13 90pc
Deborash Bhola	9175152876	lash lift&tint
Dee Henry	5164585241	3D cat B9-12 140pc
Devon Necfeld	5617797507	3D doll B11 140pc
Devra Del-decchio	5166475410	3D cat B9-11 140pc
Donna Dyreyes	5162971311	3D doll C12 180pc
Diana Eiv	5166507504	lash lift&tint
Donna Farrell	5164679771	Camellia nat D11 70pc
Donna Mazzei	5164137159	3D cat C8-12 140pc 非常自然像单根 右眼用D翘
Zhiling Lin	3477818191	3D nat B8-10 point B13 140pc
jone	5162973797	纹眉 线条`;

function parseName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { first_name: parts[0], last_name: "" };
  const last_name = parts[parts.length - 1];
  const first_name = parts.slice(0, -1).join(" ");
  return { first_name, last_name };
}

const clients = raw.split("\n").map(line => {
  const parts = line.split("\t");
  const fullName = parts[0]?.trim() ?? "";
  const phone = parts[1]?.trim() ?? "";
  const notes = parts[2]?.trim() ?? "";
  const { first_name, last_name } = parseName(fullName);
  return { first_name, last_name, phone, notes, visit_date: "", email: "", recommendation: "" };
}).filter(c => c.first_name);

console.log(`Importing ${clients.length} clients...`);

let success = 0, failed = 0;
for (const client of clients) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${ADMIN_KEY}` },
    body: JSON.stringify(client),
  });
  if (res.ok) {
    success++;
    process.stdout.write(`\r✓ ${success}/${clients.length}`);
  } else {
    failed++;
    const err = await res.text();
    console.log(`\n✗ ${client.first_name} ${client.last_name}: ${err}`);
  }
}

console.log(`\nDone: ${success} imported, ${failed} failed`);
