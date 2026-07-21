import { writeFileSync } from "fs";

const raw = `Clara Zhang\t6468532013\t3D doll D10-12 point D13-14 140pc
Clendes John Moldero\t3479043112\tCanellia doll B11 70pc
Cindy Zhang\t9175305218\tCamellia nat B11 90pc point B11-12
Chloe Zheng\t6468757770\tCamellia doll c10 70pc
Cindy Canales\t5169570075\tlash lift
Christina Peng\t6463276669\t3D cat d9-12 140pc
Christina Luboja\t5164562999\tCamellia nat B10 70pc
Cheryl Charles\t5169936811\tlash lift&tint
Cecilia Chog\t9176053231\t3D cat C9-12 140pc
Cathy NG\t7189158121\tMink cat b9-11 70pc自然
Caroline Rodriguez\t7186004985\tCamellia B9-11 90pc 自然
Carisa Kuo\t9175332548\tCamellia nat C10 70pc 自然
Carina Fung\t9174822408\tlash lift
Christina Szeto\t6462262200\t3D cat B8-11 140pc 自然
Cherry Huang\t7184154001\tCamellia nat B9 90pc 自然
Donna Koo\t9175183384\tCamellia cat C9-12 70pc 自然
Gloria Grullon\t9178221482\tCamellia doll B10 70PC
Gloria Genebroso\t3472564743\tmink cat C13 90pc
Gina Park\t6469456254\t3D wispy doll D9-11 point D13-15 140pc
Gina Dejesun\t6464048990\tCamellia nat D12 90pc 自然
Genny Romero\t5164990737\tMink nat B10 70pc 自然
Gabriella Palma\t9178644433\tlash lift&tint
Grace Park\t7189383304\tlash lift
Kathy Iorio\t5163191041\tCamellia nat C9 70pc
Mirne Herrera\t5162861541\tCamellia cat D9-11 90pc
Kathy Panaro\t7187728980\tlash lift&tint
Kuo Ping\t9178389746\t3D nat b9-10 140pc
Kimberly Sancher\t9173650674\t3D cat C13 140pc
Kathy Xu\t9177805721\tCamellia nat B9 70pc
Kathy Zou\t6264257078\t3D doll C13 140pc满
Katrina Hernandez\t5169652449\t3D doll C12 140pc
Kathy PI\t9174952129\tCamellia nat b8 70pc
Kelly Gatanas\t9177570002\t3D nat B11 140pc
Kerri Kissane\t5167543840\t3D nat B8-9
Katia Hoffrnan\t5162790237\tCamellia cat b10 自然
Kristen Reyes\t3476146958\t3D doll C10-12 point c12-14 140pc
Klaum Kiera\t5166808356\tlash lift&tint
Karen Breen\t5166520481\tCamellia nat B9 90pc
Kat Colato\t5166662494\t3D cat C10-12 mix13 point 14-15 140pc
Kathryn Auriemma\t5164281181\tlash lift&tint
Aylie Zhou\t6312028215\t3D doll C10-11 point C12-14 泰式
Aslam Raziya\t5166147964\tCamellia nat B10 70pc自然
Ashley Pacheco\t3472379339\t3D B8-10 point B13-15 140pc
Ashley Jourden\t5166474511\tlash lift&tint
Arwa Ali\t5166615383\tlash lift&tint
Aliacia NG\t9178683810\t3D cat B9-11 point B12-14 140pc 八点定位不要太满
Ardeania Clark\t2482294853\tCamellia cat C9-12 90pc
Annenarie Devivo\t5164595671\t3D nat B10 140pc
Anna Sshargani\t5129911416\tlash lift&tint
Anna Cheung\t5169888592\tCamellia doll C10 90pc
Ann Zheng\t2153561098\t3D cat B8-9 point B10-12 140pc
Anastasia Visich\t6316803602\tlash lift&tint
Anastasia Gotenas\t9293693415\t3D cat B8-11 90pc 自然
Anais Vortanion\t8186538277\t
Amy Shapira\t5163536284\tCamellia nat B9 90pc
Amy Grossman\t5166627197\tCamellia doll B10 70pc
Alysha Diaz\t3477839427\t3D cat B13 140pc
Alli Rothnan\t9177447497\t3D doll C12 140pc自然
Allza Misnra\t6318737483\tMink cat B13 70pc
Alice Vchiyama\t5163958759\tCashmere doll B10 70pc
Alian Esther\t5165543488\t3D cat C11 140pc
Alexandra Penzi\t5165877241\tlash lift&tint
Alexa Kava\t5162361412\tlash lift&tint
Ashley Rushell\t6319487073\t3D cat B9-12 point B13-14 140pc密
Ada Xie\t6319949998\tCamellia doll C8-10 point C10-12 90pc
Britteng Kalosza\t7164001551\tlash lift&tint
Brittany Farkouh\t5162429748\tCamellia doll D12 90pc非常自然
Briana Scarpa\t5163060425\t3D nat B8-10 自然
Bibi Doobay\t6468416663\tCamellia cat C10-13 110pc满
Bella Song\t6173721487\t3D B8-9 30-40pc point B10-12 20pc 140pc
Bella Fanelli\t7189260168\tCamellia nat B12 70pc
Baliene Woutersz\t9175199604\tCamellia nat B10 90pc
Brooke Krieger\t6318965438\t3D doll C12 140pc
Breann Hill\t5083608884\tMink c12 point C14 70pc
Enida Brown\t7186003916\t3D nat B11-13 140pc自然
Emma Cruz\t5164393872\tCamellia Doll B10 90pc
Emily Muhistock\t5166756500\tlash lift&tint
Emily locker\t5166031426\tlash lift&tint
Emily Leventhal\t5164138536\tlash lift&tint
Emily Brandt\t5169435175\t3D doll C9-12 180pc
Elaine Cullen\t6318278615\t3D nat B11 140pc
Eileen Yen\t9174689496\tCashmere cat B14 90pc
Evelyn Aioala\t5165210251\tCamellia nat b8 70pc自然
Farah Fenelon\t5165825386\t3D doll C9-12 point C12-14 140pc
Elisa\t9177057804\tCshmere cat B11 70pc
Elizabeth Oladipo\t3477224101\t3D doll C10-12 point C13-15 140pc 九点定位
Elizebeth Salcoun\t8312776090\t3D doll B9-12 point B12-14
Ella Ledwith\t5166678058\tcamellia nat C11 70pc
Emanuela Pattolo\t5167805263\tCamellia cat B11 90pc
Emelinda Vecchio\t9172736772\tCamellia nat B11 70pc
Emilsa Jeronimo\t7185785728\tlash lift&tint
Emma Wang\t9179129963\tCamellia Doll C9-10 point C11-12 90pc
Emily Bianco\t5167742838\t3D doll B10-11 point B12-14 140pc
Esraa Arafa\t6467635142\t3D doll D11-14 140pc满
Hindy Kadosh\t9087839197\tlash lift&tint
Henze Marvin\t4154202438\tCamellia doll B10 110pc
Heather Yu\t7202241640\tCamellia open B10 110pc
Hannah Ko\t5164921328\t3D doll B11-13 140pc
Hana Pappas\t2017397420\tlash lift&tint
Freya Feng\t6464139880\t3D doll D10 140pc 满
Fiona Wang\t3473997543\t3D DOLL c10-12 140pc
Farhat Chowdhury\t9294055190\t3D doll C10-12 point C13-15 140pc
Isys Morris\t5162634423\t3D nat B11 140pc 白嫖怪
Isadorah Victor\t3477551665\t3D C8-10 point C12-14
Isabella Martinaz\t5166803868\t3D cat B8-11 point B10-12 140pc
Isabella Liu\t7186669744\tCamellia doll B10 90pc
Isabella Chen\t6313468669\t3D C9-10mix11 point D13-14 140pc
Isabel Aislos\t9294335963\t3D cat B12 140pc
Iris Ore\t5168173586\tlash lift&tint
Iris Cai\t5165267660\tCamellia doll C9-11 point D13-14 70pc
Judy Tsai\t5166619821\t3D nat B11 140pc 不开花
Judy Mirharoon\t5167881634\tlash lift&tint
JuanJuan Zheng\t9294108297\tCamellia doll B8-10 point B11-12
Josephine Cho\t5168169989\t3D doll B12 140pc
Jocelyne Merlos\t5166433560\tCashmere doll C10-12 70pc
Jocelyn Membreno\t5167496871\t3D cat C12 140pc
Jocelia Zabala\t5168158353\tCamellia doll B9-11 90pc 自然
Joanne Suen\t9173612171\t3D doll D10-13 140pc
Jisdy Portorred\t9178914566\t3D cat B13 180pc
Jillian Dilemme\t5164924447\tlash lift&tint
Jihan Corso\t9175665276\tCamellia cat C12 90pc
Jiaru Liu\t3128262161\t3D doll B9-11 自然
Jenny Kwon\t9297331331\t3D nat D11-13 140pc满
Jennifer You\t3472212703\tlash lift&tint
Jennifer Rianardson\t7815343832\tCamellia nat C11 90pc
Jennie Dai\t9496179446\t3D doll C10 point C13-14 140pc
Jennia Hakakian\t5164844880\tCahmere cat B11 90pc
Jenna Marie\t5165326927\tlash lift&tint
Jenna Behar\t5169657258\t3D cat D12 140pc
Jasmin Meves\t3478441581\tlash lift&tint
Jane Qin\t5168493803\tCamellia cat D10 90pc
Jing Liu\t9294290424\tCamellia doll B8-10 point B10-11 140pc
Jacquia Jucean\t9174060014\tlash lift&tint
Jacklyn Kelly\t3477210196\tlash lift&tint
Kaclyn Carey\t5163614331\tCamellia cat C13 70pc
Jessica YI\t6466230089\tCashmere nat B10 70pc
Jennifer Yi\t6465847344\t3D cat B12 140pc 自然
Jeliet Wan\t3473287268\tCamellia doll B10 90pc
Julie Diry\t6126369650\t3D doll B8-9 point B10-12 140pc
Julianna Schepanski\t5166424466\t3D doll C13 140pc
Julia Han\t4259991043\tCashmere cat C12 70pc
Lina Chung\t9179138870\t3D doll C13 140pc
Lina Nelko\t5164399971\t3D cat C8-11 140pc
Lina Lejla\t9292107054\t3D cat mix doll C9-11 140pc
Lina Joo\t6464316274\tCamellia cat B8-10 90pc
Linda Nica\t5164399973\tCahshmere cat B9-11 90pc
Ling Zheng\t5168849328\t3D doll C9-11 point C13-14 140pc
Lina Gormley\t9177160804\tCamellia nat D11 90pc
Linda Stampler\t5163137149\tMink nat B10 70pc
Lily Latai\t5166436416\t3D doll C12 140pc
Laura Grazi\t9173970216\tlash lift&tint
Lisa Olives\t9292246692\t3D cat B10 140pc自然
Lilli Eimmerman\t6313790089\tlash lift&tint
Li Ye\t6502248566\tCamellia nat B19 70pc
Leslie Dominicci\t2525786671\t3D cat B9-12 point B12-14 140pc
Lenita Doobay\t6468417695\t3D cat C11-14 140pc
Lauren Tully\t6463535394\tlash lift
Laura Runcie\t2017079372\tCamellia cat B10 90pc
Laura Bhola\t9175152872\tlash lift&tint
Laura Gelb\t9144331993\tCamellia nat C11 70pc
Lauren Binenbaum\t9175797636\tCamellia cat B10 70pc
Lauren Margiotta\t5164779435\tlash lift+bottom lash
Lauren Peart\t9143168983\t3D cat B11 140pc
Laura Ciamiciam\t9179517287\t3D cat C11 180pc
Lauren Stipp\t9175959939\tCamellia cat B10 90pc自然
Morma Moledo\t5163187125\tlash lift&tint
Nora Bianco\t5164593638\tCamellia doll B8-9 point B11-12 110pc
Nicole Yan\t9292188997\t3D C10 mix C11 point doll B8 140pc
Nicole Pecora\t7188014091\tCamellia cat D13 110pc
Nicole Conway\t5165028433\tlash lift&tint
Nicki Geiger\t5167245124\tMink doll C13 90pc
Natasha Castro\t5165280799\tCamellia doll C13 90pc
Natalia Lozada\t7187515838\tlash lift&tint
Nancy Chris\t5166889275\tMink cat B8-10 70pc自然
Nicole Eiggle\t5164620856\tlash lift
O Fance Rania\t6464134383\tCamellia nat B11 110pc 自然
Orabhjot Dhaliwal\t5167286184\tMink doll C10-12 70pc
Piya Baiaj\t5167896718\tCamellia doll C13 70pc
Phoenix\t5179756286\tCamellia doll B9 70pc
Paige Retracca\t3036253017\t3D nat B9 140pc
Patricia Papataros\t9175092759\t3D cat B8-13 140pc满非常猫眼
Qian Yang\t6318820022\tCashmere nat B12 70pc
Rosmery Mendoza\t6314312072\tCamellia nat B11 70pc
Rivka Earifpoa\t5166031444\tCamellia nat B12 90pc自然
Reyueh Nadi\t5162889660\t3D cat B9-12非常猫眼
Raissa Petracca\t5163303566\tCamellia nat B9 70pc
Rachel\t3473067848\tCamellia nat B10 70pc自然
Ryan Petracca\t5162637767\tCamellia nat B11 90pc
Sabrina Roszro\t5164573331\tCashmere nat B11 70pc 自然
Sabrina Tang\t6463582435\t3D doll B8-10 point B11-12 140pc
Sandeep Kavr\t5167847520\t3D cat B13 140pc 小花自然
Samdra Lang\t9178172524\tCamellia cat B10 70pc
Sydney Taduran\t9177753716\t3D cat C13 140pc满
Susie Chun\t9175134145\tCamellia cat B9-11 point C10-12 110pc
Susan Paulsen\t5168498045\tCashmere nat B10 70pc自然
Sunny Lin\t9176892488\tCamellia doll C10-12 point D13-14 70pc
Stephanie Martine\t3477243230\t3D cat C10 140PC不开花
Stella Golia\t3475850147\t3D cat C14 180pc小开花
Stacey Giuffre\t5163136109\t3D doll C15 180pc满
Sophie Mason\t5164230018\tlash lift&tint
Sophia Stipp\t5163293693\t3D doll C13 140pc
Sophia Chen\t9293199738\tCamellia doll D10 70pc自然
Sonia Zheng\t9173552539\tCashmere cat B11 90pc
Sonia Perez\t9172511027\tMink cat C12 70pc
Sofia Villafane-Hirsch\t9178218510\tCamellia cat B10 70pc
Sirni Simrat Gill\t5169746211\t3D cat C10-13 140pc满
Sidra Khan\t3472967264\tlash lift&tint
Shueta Sonha\t5516558616\twaxing
Shinvani Mehta\t7146790080\tlash lift&tint
Serena Singh\t3476046666\tCamellia cat B12 90pc
Selina\t9174426795\tCamellia cat B9 90pc 自然
Sarah Lee\t2018893198\t3D doll D12 140pc 小花
Sandy Wang\t9176357596\tCamellia doll C10 point C11-12 110pc
Sydney Martin\t5165780182\tlash lift&tint
Tina Zhen\t5165372002\tlash lift
Tina Wei\t5168589678\tCamellia doll c10 70pc
Taylor Farkouh\t5164770859\tMink nat C13 90pc
Tatyana Sinn\t7324858218\t3D cat B9-12 140pc不开花
Tammy NG\t9176176763\tCamellia doll C11 90pc
Tali\t5165829226\tCashmere Doll C10-12 110pc
Tameka Olives\t3475313429\t3D C10-12 point C13-15 140pc
Vivian Lee\t3476056436\tCamellia doll B8-10 90pc 自然
Victoria Wang\t5163889192\tCamellia nat B10 70pc
Vanessa Li\t7183620812\t3D nat B10 140pc自然
Vivian Zeng\t6467503138\t3D doll C10 B8 9mix 140pc
Wynee Martinez\t7184270035\t3D cat B12 140pc
Winnie Weng\t9294988596\tCamellia cat B8-10 point B10-11自然
Wendy Zeng\t6463791180\tCamellia doll B11 point C12-14 110pc自然
Wendy Mei\t9173628219\t3D LB9-11 point D14-15 140pc
Yana Drand\t6316179449\t3D doll B11 180pc 大花
Yolanda Segura\t9293208314\t3D cat B10 140pc
Yasmin Delao\t5166805820\tlash lift&tint
Yuqing Jiao\t2164074904\t3D doll B8-9 point B9-12 140pc
Ximena Narvaez\t5168708794\t3D doll B12 140pc
Xiaoyue Zhang\t6467278592\t3D B7-10 point C11-14 140pc 狐系
Maria Cothdis\t9177501543\t3D nat C9-12 180pc 满
美乐Dai太太\t5165786763\tCamellia nat B9 70pc
Morren Whalley\t7877738807\tlash lift&tint
Moj Noor\t3106223776\t3D nat B10 140pc
Miayoung Hoggtgt\t9177504718\tCamellia nat B10 70pc
Melody Kang\t5163504972\t3D doll B10 140pc
Mia Liu\t6314923339\t3D doll C12-14 九点定位140pc
Millie Banegas\t5167389101\t3D doll C12 140pc
Mindy Dek\t5166066186\t3D nat D10-12 140pc
Mindy Lee\t6462670073\t3D cat C12 140pc
Miranda Kaur\t5168526262\t3D nat B11 140pc
Miriam Zarifpoa\t6464040110\tCamellia cat B11 90pc
Maria Mardareuch\t5163308420\tCamellia cat B8-11 90pc
Maria Marcodo\t9175777087\tlash lift&tint
Meli Chun\t9176923445\t3D cat C11-14 140pc
May Wong\t6462872612\tlash lift
Meiyen Yeh\t5166609535\t3D nat B9 140pc
May Lee\t6464418023\tCamellia doll C8-10 90pc
Marta Reilly\t2123807553\t3D doll C11 140pc 满
Mary Lepore\t9178682685\tlash lift&tint
Martina Tully\t9176697926\tlash lift
Marcia Thomas\t3476816511\t3D cat C12 180pc
Marta Gabrielli\t5164913988\tCamellia Cat B8-10 110pc
Marisa Chan\t5167039550\tlash lift
Marilyn Zallo\t9178823436\tCamellia cat B10 70pc
Mirielle Bruno\t3479817928\t3D nat C14 140pc
Mirtha Cifuentes\t7188775860\tCamellia nat B12 90pc
Mati Pearson\t6467404938\tCamellia doll C13 70pc
Minna Levy\t3474268883\tlash lift
Mesha\t5162057934\t3D doll D11-14 140pc
Mergaret Pace\t5163199479\tCamellia nat B9 90pc 自然
Maria Tapage\t9174002113\t3D doll D11-13 140pc
Danielle Siegel\t3477490654\tCashmere doll C10-12 90pc 自然
Darian Hemando\t5162054579\t3D doll B10-11 mix point B11-13 140pc
Daisy Pimentel\t6462882916\t3D cat C10-12 point C13-15 180pc
Debbie Landskousky\t5166613631\tCamellia cat C13 90pc
Deborash Bhola\t9175152876\tlash lift&tint
Dee Henry\t5164585241\t3D cat B9-12 140pc
Devon Necfeld\t5617797507\t3D doll B11 140pc
Devra Del-decchio\t5166475410\t3D cat B9-11 140pc
Donna Dyreyes\t5162971311\t3D doll C12 180pc
Diana Eiv\t5166507504\tlash lift&tint
Donna Farrell\t5164679771\tCamellia nat D11 70pc
Donna Mazzei\t5164137159\t3D cat C8-12 140pc 非常自然像单根 右眼用D翘
Zhiling Lin\t3477818191\t3D nat B8-10 point B13 140pc
jone\t5162973797\t纹眉 线条`;

const esc = s => s.replace(/'/g, "''");

function parseName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts.slice(0, -1).join(" "), last: parts[parts.length - 1] };
}

const clients = raw.split("\n").map(line => {
  const [name, phone, notes = ""] = line.split("\t");
  const { first, last } = parseName(name.trim());
  return { first: first.trim(), last: last.trim(), phone: phone?.trim() ?? "", notes: notes.trim() };
});

const rows = clients.map(c =>
  `('${esc(c.first)}','${esc(c.last)}','${esc(c.phone)}','${esc(c.notes)}',NULL,'','','')`
).join(",\n");

const sql = `-- Step 1: Add elly column
ALTER TABLE clients ADD COLUMN IF NOT EXISTS elly TEXT DEFAULT '';

-- Step 2: Insert ${clients.length} new clients
INSERT INTO clients (first_name, last_name, phone, notes, visit_date, email, recommendation, elly)
VALUES
${rows};
`;

writeFileSync("scripts/clients-import.sql", sql, "utf8");
console.log(`Generated scripts/clients-import.sql with ${clients.length} clients`);
