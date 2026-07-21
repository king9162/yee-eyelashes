-- Yee Eyelashes — Square appointment import
-- Paste and run in Supabase SQL editor (Dashboard → SQL Editor → New query)
-- Safe to review first; run ONCE to avoid duplicates.

BEGIN;

-- ── 1. Import bookings ────────────────────────────────────────────────────────
INSERT INTO bookings (name, phone, email, service, service_label, date, "time", notes, status, duration_min)
VALUES
  ('Donna Koo','(917) 518-3384','donna.c.koo@gmail.com','imported','Haircut - Regular','2026-04-16','10:15 AM','canellia sanyecao C curl 9 10 1112','cancelled',30),
  ('Donna Koo','(917) 518-3384','donna.c.koo@gmail.com','imported','6-8 week Touch up','2026-04-17','12:15 PM',NULL,'cancelled',90),
  ('Donna Koo','(917) 518-3384','donna.c.koo@gmail.com','imported','Bottom lashes','2026-04-17','12:15 PM',NULL,'cancelled',20),
  ('Donna Koo','(917) 518-3384','donna.c.koo@gmail.com','imported','Bottom lashes + Classic 60pc','2026-04-17','12:30 PM',NULL,'cancelled',70),
  ('Llana Maguire','+15168526339','','imported','Brow Tint','2026-04-17','2:00 PM',NULL,'cancelled',30),
  ('Llana Maguire','+15168526339','','imported','Bottom lashes','2026-04-17','4:00 PM',NULL,'cancelled',20),
  ('Llana Maguire','+15168526339','','imported','Brow Lamination+Shaping','2026-04-21','6:15 AM',NULL,'confirmed',60),
  ('QUentin LIU','+15309337152','0906yuliang@gmail.com','imported','Classic 60pc New Set','2026-05-01','10:30 AM',NULL,'cancelled',60),
  ('QUentin LIU','+15309337152','0906yuliang@gmail.com','imported','Classic 60pc New Set','2026-05-06','10:00 AM',NULL,'cancelled',60),
  ('Shamecca Singleton','+13476754940','singletonshamecca@gmail.com','imported','New Set - 60pcs','2026-05-07','9:30 AM',NULL,'confirmed',60),
  ('Wendy Sanchez','(347) 984-4897','sanchez.w326@yahoo.com','imported','New Set - 60pcs','2026-05-09','12:00 PM',NULL,'confirmed',60),
  ('Syra Farhat','+16463797793','farhat.syra@gmail.com','imported','New Set - 80pcs','2026-05-09','5:00 PM',NULL,'confirmed',60),
  ('aveena khan','+13475518556','veenaahank@gmail.com','imported','New Set - 60pcs','2026-05-14','1:00 PM',NULL,'confirmed',60),
  ('Donna Koo','(917) 518-3384','donna.c.koo@gmail.com','imported','New Set - 60pcs','2026-05-14','3:00 PM',NULL,'confirmed',60),
  ('Rebecca Haarlow','(310) 405-3754','rhaarlow@gmail.com','imported','New Set - 120pcs','2026-05-15','4:00 PM',NULL,'confirmed',90),
  ('Anna Solinsky','(917) 903-9891','anna.solinsky@gmail.com','imported','1 Week Refill - 60pcs','2026-05-15','5:30 PM',NULL,'cancelled',60),
  ('Maria m','+19174400217','','imported','3 Week Refill - 100pcs','2026-05-16','1:00 AM',NULL,'confirmed',60),
  ('Emily','+15169022205','','imported','New Set - 120pcs','2026-05-16','11:00 PM',NULL,'confirmed',90),
  ('Nora n','+19292199812','','imported','New Set - 100pcs','2026-05-17','2:30 AM',NULL,'confirmed',90),
  ('STEPHANIE MARTINEZ','+13477243230','nani417@yahoo.com','imported','New Set - 120pcs','2026-05-17','9:30 AM',NULL,'cancelled',90),
  ('M M','+13019798887','Jkwnebeh@gmail.com','imported','2 Week Refill - 60pcs','2026-05-17','6:00 PM',NULL,'cancelled',60),
  ('Rebecca Haarlow','(310) 405-3754','rhaarlow@gmail.com','imported','Eyelash Extension + New Set 80pcs','2026-05-18','3:00 PM',NULL,'confirmed',80),
  ('Lina gormely','','','imported','3 Week Refill - 80pcs','2026-05-19','9:30 PM','camellia nat D11 90','confirmed',60),
  ('sydney','+16468377777','','imported','New Set - 80pcs','2026-05-20','5:00 AM',NULL,'confirmed',60),
  ('Unknown','+16313036925','','imported','New Set - 100pcs','2026-05-22','1:00 PM','Wispy','confirmed',90),
  ('Cait Chen','+19175757501','caitchen@gmail.com','imported','New Set - 80pcs','2026-05-22','2:30 PM',NULL,'confirmed',60),
  ('Unknown','+15163178027','','imported','New Set - 60pcs','2026-05-22','3:30 PM',NULL,'confirmed',60),
  ('Unknown','+13477224101','','imported','New Set - 100pcs','2026-05-22','4:30 PM',NULL,'confirmed',90),
  ('Unknown','+13477712631','','imported','New Set - 60pcs','2026-05-22','6:00 PM',NULL,'confirmed',60),
  ('Wendy Sanchez','(347) 984-4897','sanchez.w326@yahoo.com','imported','2 Week Refill - Design Style','2026-05-23','12:30 AM',NULL,'cancelled',90),
  ('Wendy Sanchez','(347) 984-4897','sanchez.w326@yahoo.com','imported','New Set - 60pcs','2026-05-23','11:00 AM',NULL,'cancelled',60),
  ('Linda Thao','(503) 781-3314','Dabee-t@hotmail.com','imported','New Set - 120pcs','2026-05-24','10:00 AM',NULL,'confirmed',90),
  ('Emily Mathews','(516) 902-2205','Emilyclarice@gmail.com','imported','1 Week Refill - 140pcs','2026-05-25','1:00 PM','I came in for an appointment last Sunday but now would like more volume added.','confirmed',90),
  ('Admes','+16319020852','','imported','3 Week Refill - 120pcs','2026-05-26','1:30 PM',NULL,'confirmed',90),
  ('M M','+13019798887','Jkwnebeh@gmail.com','imported','1 Week Refill - 60pcs','2026-05-27','10:00 AM',NULL,'cancelled',60),
  ('Toni Malatronte','+19175386890','','imported','Phone Appointment','2026-05-27','11:45 AM',NULL,'confirmed',90),
  ('Toni Malatronte','+19175386890','','imported','Phone Appointment','2026-05-27','12:30 PM',NULL,'cancelled',90),
  ('Unknown','+19292684024','','imported','New Set - 80pcs','2026-05-27','1:00 PM','Groupon','confirmed',60),
  ('Sabrina','+15163558662','','imported','Phone Appointment','2026-05-27','2:15 PM',NULL,'confirmed',90),
  ('Unknown','+17188028190','','imported','Phone Appointment','2026-05-27','4:00 PM',NULL,'confirmed',90),
  ('Unknown','+18627632352','','imported','Phone Appointment','2026-05-27','5:30 PM',NULL,'confirmed',90),
  ('Stacey Giuffre','+15163136109','','imported','New Set - 180pcs','2026-05-27','6:00 PM',NULL,'cancelled',120),
  ('Henza Marvin','+14154202438','','imported','New Set - 100pcs','2026-05-28','9:30 AM','camellia 110pc Doll eye B10','cancelled',90),
  ('Irena Lin','+16462808711','Janelin1017@gmail.com','imported','New Set - 80pcs','2026-05-28','10:00 AM',NULL,'confirmed',60),
  ('Christy','+19292183182','','imported','New Set - 100pcs','2026-05-28','11:00 AM',NULL,'confirmed',90),
  ('Tina','+15165069894','','imported','Phone Appointment','2026-05-28','12:00 PM',NULL,'confirmed',90),
  ('jisely portorreal','+19178914566','jiselyportorreal@gmail.com','imported','New Set - 80pcs','2026-05-28','1:30 PM',NULL,'confirmed',60),
  ('caroline kim','(917) 324-6222','kimcjiin@gmail.com','imported','3 Week Refill - 60pcs','2026-05-28','2:30 PM',NULL,'confirmed',60),
  ('Unknown','+15164125263','','imported','Lash Lift & Tint','2026-05-28','4:00 PM',NULL,'confirmed',45),
  ('Stacey Giuffre','+15163136109','','imported','Phone Appointment','2026-05-28','6:00 PM',NULL,'cancelled',90),
  ('Lauren Stipp','+19175959939','','imported','Phone Appointment','2026-05-29','12:00 AM',NULL,'confirmed',89),
  ('Emily Brandt','+15169435157','','imported','3 Week Refill - 180pcs','2026-05-29','10:00 AM',NULL,'cancelled',120),
  ('Henza Marvin','+14154202438','','imported','Phone Appointment','2026-05-29','12:30 PM',NULL,'confirmed',90),
  ('Stacey Giuffre','+15163136109','','imported','Phone Appointment','2026-05-29','5:15 PM',NULL,'confirmed',90),
  ('shanyalee Rodriguez','(917) 796-0040','shanyaleegreenblatt@gmail.com','imported','New Set - 100pcs','2026-05-30','9:30 AM',NULL,'confirmed',90),
  ('Makena Mcmanus','+15167573113','','imported','Phone Appointment','2026-05-30','11:00 AM',NULL,'confirmed',90),
  ('Julie Rosochacki','(248) 890-4499','julierosochacki@gmail.com','imported','2 Week Refill - 120pcs','2026-05-31','10:30 AM',NULL,'cancelled',90),
  ('Jessica Ong','(646) 836-0692','jessicawyong@icloud.com','imported','New Set - 80pcs','2026-06-01','9:30 AM',NULL,'confirmed',60),
  ('Jessica Ong','(646) 836-0692','jessicawyong@icloud.com','imported','Phone Appointment','2026-06-01','10:00 AM',NULL,'confirmed',90),
  ('Emily Brandt','+15169435175','','imported','Phone Appointment','2026-06-01','1:00 PM',NULL,'confirmed',90),
  ('Rebecca Haarlow','(310) 405-3754','rhaarlow@gmail.com','imported','2 Week Refill - 100pcs','2026-06-01','3:00 PM',NULL,'confirmed',60),
  ('Anais Vortenion','+18186538277','','imported','Phone Appointment','2026-06-01','5:00 PM',NULL,'confirmed',90),
  ('Mesha','+15162057934','','imported','Phone Appointment','2026-06-01','6:30 PM',NULL,'confirmed',90),
  ('Patricia Papataros','+19175092759','','imported','Phone Appointment','2026-06-02','10:00 AM',NULL,'confirmed',90),
  ('Patricia Papataros','+19175092759','','imported','Phone Appointment','2026-06-02','10:00 PM',NULL,'confirmed',90),
  ('Unknown','+13479983843','','imported','Phone Appointment','2026-06-03','10:00 AM',NULL,'confirmed',90),
  ('Rachel Rosen','+15164920145','rachelpaige14@gmail.com','imported','Lash Lift & Tint','2026-06-03','12:00 PM',NULL,'confirmed',45),
  ('Rechel Rosen','+15164920145','','imported','Phone Appointment','2026-06-03','12:00 PM',NULL,'confirmed',90),
  ('Donna Farrell','','','imported','3 Week Refill - 80pcs','2026-06-04','12:00 AM',NULL,'cancelled',60),
  ('test tes','+15309337152','0906yuliang@gmail.com','imported','New Set - 60pcs','2026-06-04','9:30 AM',NULL,'cancelled',60),
  ('M M','+13019798887','Jkwnebeh@gmail.com','imported','New Set + 1 Week Refill 60pcs','2026-06-04','10:30 AM',NULL,'confirmed',120),
  ('Test Test','+15309337152','0906yuliang@gmail.com','imported','New Set - 60pcs','2026-06-04','11:30 AM',NULL,'cancelled',60),
  ('Test Test','+15309337152','0906yuliang@gmail.com','imported','1 Week Refill - 60pcs','2026-06-04','11:30 AM',NULL,'cancelled',60),
  ('Donna mazzei','+15164137159','','imported','3 Week Refill - 100pcs','2026-06-04','11:30 AM',NULL,'cancelled',60),
  ('Donna Farrell','','','imported','3 Week Refill - 80pcs','2026-06-04','12:00 PM','camellia. nat D11. 70 pc little full','confirmed',60),
  ('QUentin LIU','+15309337152','0906yuliang@gmail.com','imported','2 Week Refill + New Set','2026-06-04','2:00 PM',NULL,'cancelled',150),
  ('Forozan','+15162635436','','imported','Phone Appointment','2026-06-05','10:00 AM','Doll c11 80pc','confirmed',90),
  ('Tiffany','+15162327813','','imported','Phone Appointment','2026-06-05','11:00 AM','cat c14','confirmed',90),
  ('Romina Troulakis','+17183086796','','imported','Phone Appointment','2026-06-05','11:30 AM','nat c10 80pc','confirmed',90),
  ('EVA','+15167540639','','imported','Phone Appointment','2026-06-05','1:00 PM','cat C14 100pc','confirmed',90),
  ('Sandy Weng','+19176357596','','imported','Phone Appointment','2026-06-05','1:30 PM','sunflower LC11','confirmed',90),
  ('Emily','+15163191697','','imported','Phone Appointment','2026-06-05','1:45 PM',NULL,'confirmed',45),
  ('Rachel','+16468535657','','imported','Phone Appointment','2026-06-05','2:00 PM','Doll D12 3D180pc','confirmed',90),
  ('Emma Ribette','+15166609738','emmaribette@gmail.com','imported','New Set - 80pcs','2026-06-06','10:30 AM','nat c13 80 pc. Client note: first time client, Groupon 80pc/eye.','confirmed',60),
  ('Loraina','+17189544731','','imported','Phone Appointment','2026-06-06','3:00 PM','Nat C11 100pc','confirmed',60),
  ('Test Liu','+15309337152','0906yuliang@gmail.com','imported','New Set + 1 Week Refill 60pcs','2026-06-08','9:30 AM',NULL,'cancelled',120),
  ('Kristy Holden','+19172715074','Madbiller24@gmail.com','imported','New Set - 100pcs','2026-06-08','9:30 AM','Doll eye C13 100 pc. Client: Groupon for volume 100pc/eye.','confirmed',90),
  ('Lina Gormley','+19177160804','','imported','3 Week Refill - 80pcs','2026-06-08','9:30 AM','camellia D11. 90 pc nat look','confirmed',60),
  ('Thailyn Cruz','+16317907920','thaixcruz2007@gmail.com','imported','New Set - Design Style','2026-06-08','10:30 AM','lc 13 Animal 7 point','confirmed',90),
  ('Sarah Petruccelli','+15164219084','Sarahpetruccelli28@gmail.com','imported','Lash Lift & Tint + Eyelash Removal','2026-06-08','12:30 PM','Client: Can we include removal within the service for a discount? Thank you!','confirmed',65),
  ('Samantha','+15169467672','','imported','Phone Appointment','2026-06-08','4:00 PM','lifting & tint','confirmed',60),
  ('Inna','','','imported','Phone Appointment','2026-06-09','6:30 AM',NULL,'cancelled',90),
  ('Inna','','','imported','Phone Appointment','2026-06-09','6:30 PM',NULL,'confirmed',90),
  ('Kristina (Jennifer Xie friend)','+15162503996','','imported','Phone Appointment','2026-06-10','10:00 AM',NULL,'confirmed',60),
  ('Rachel Kalogiannis','(646) 647-0178','rachelgallant@live.com','imported','New Set - 60pcs','2026-06-11','10:00 AM','nat c 9 100pc 0.15','confirmed',60),
  ('caroline kim','(917) 324-6222','kimcjiin@gmail.com','imported','2 Week Refill - 60pcs','2026-06-11','1:00 PM','cat c11. right eye C12. Client: needs to leave by 2pm.','confirmed',60),
  ('jerry','','','imported','Phone Appointment','2026-06-11','2:00 PM','9417043988','cancelled',90),
  ('Yoomi Park','+16463509927','','imported','Phone Appointment','2026-06-12','11:30 AM',NULL,'confirmed',60),
  ('Unknown','+13476177679','','imported','Phone Appointment','2026-06-12','2:00 PM',NULL,'confirmed',60),
  ('GINA PARK','(646) 945-6254','ginapark26@gmail.com','imported','New Set - 80pcs','2026-06-13','10:00 AM','NEW CUSTOMER','cancelled',60),
  ('Sue Lin','+15166803415','shuyaraghi@gmail.com','imported','New Set - 80pcs','2026-06-15','10:00 AM',NULL,'confirmed',60),
  ('Gisele De La Cruz','+19148829803','giseledlc@gmail.com','imported','New Set - 80pcs','2026-06-16','2:00 PM',NULL,'confirmed',60),
  ('Donna mazzei','+15164137159','','imported','Phone Appointment','2026-06-16','2:30 PM',NULL,'confirmed',60),
  ('Allison Mulvaney','(516) 428-3077','allisonmulvaney1@gmail.com','imported','New Set - 80pcs','2026-06-18','11:00 AM',NULL,'confirmed',60),
  ('Cait Chen','+19175757501','caitchen@gmail.com','imported','Phone Appointment','2026-06-19','10:30 AM',NULL,'confirmed',90),
  ('Zaria Morales','+17132546270','moraleszaria143@gmail.com','imported','New Set - 100pcs','2026-06-20','1:00 PM',NULL,'confirmed',90),
  ('kimberly sarichar','','','imported','New Set - 120pcs','2026-06-22','5:30 AM','3D CAT C13 140 PC','cancelled',90),
  ('Linda Thao','(503) 781-3314','Dabee-t@hotmail.com','imported','New Set - 120pcs','2026-06-22','10:00 AM',NULL,'confirmed',90),
  ('kimberly sarichar','','','imported','New Set - 140pcs','2026-06-22','5:30 PM',NULL,'confirmed',90),
  ('Sesa','+15162422514','','imported','2 Week Refill - Design Style','2026-06-23','11:30 AM',NULL,'confirmed',90),
  ('Rachel Kalogiannis','(646) 647-0178','rachelgallant@live.com','imported','2 Week Refill - 100pcs','2026-06-25','10:00 AM',NULL,'confirmed',60),
  ('Lina Gormley','+19177160804','','imported','Phone Appointment','2026-06-29','9:30 AM',NULL,'confirmed',60),
  ('ROSE ANNE OLEGARIO','+15165134857','miszxros3@gmail.com','imported','New Set - 120pcs','2026-07-04','11:00 AM',NULL,'confirmed',90),
  ('Gisele De La Cruz','+19148829803','giseledlc@gmail.com','imported','New Set - 80pcs','2026-07-06','2:00 PM',NULL,'cancelled',60)
;

-- ── 2. Sync unique real clients into My Clients panel ─────────────────────────
-- Deduplicates by email/phone; skips unknowns and test entries.
INSERT INTO clients (first_name, last_name, phone, email, visit_date, notes)
SELECT
  split_part(name, ' ', 1)                                                    AS first_name,
  CASE WHEN position(' ' IN name) > 0
       THEN NULLIF(trim(substr(name, position(' ' IN name) + 1)), '')
       ELSE NULL END                                                           AS last_name,
  phone, email, date AS visit_date, notes
FROM (
  SELECT DISTINCT ON (COALESCE(NULLIF(email,''), NULLIF(phone,''), name))
    name, phone, email, date, notes
  FROM bookings
  WHERE service = 'imported'
    AND name NOT IN ('Unknown','test tes','Test Test','Test Liu','jerry','Inna','Donna Farrell')
    AND name NOT LIKE 'QUentin%'
  ORDER BY COALESCE(NULLIF(email,''), NULLIF(phone,''), name), date DESC
) sub;

COMMIT;
