
insert into materiel (nom) values ("Portable"),("Imprimante"),("Serveur");
insert into marque (nom) values("HP"),("DELL"),("OMEN");
insert into section (nom) values ("ME"),("ME1"),("ME2");
insert into etat (nom) values ("OK"),("casse"),("neuf");
insert into lieu (nom) values("203"),("204"),("205");
insert into item values (22001,1,1,"SIU","WEIURHWEU","PROD12172723",2,1,1,"OUI","2022-04-12",5,"2027-04-12",1200);
insert into item values (22002,2,1,"SIU","WEIURHWEU","PROD12172723",1,1,1,"SHEEESH","2022-04-12",5,"2027-04-12",1200);
insert into item values (22003,1,2,"SIU","WEIURHWEU","PROD12172723",1,2,2,"NEIN","2022-04-12",5,"2027-04-12",1200);
insert into item values (22004,1,2,"SIU","WEIURHWEU","PROD12172723",1,1,2,"NON","2022-04-12",5,"2027-04-12",13300);

insert into item values (22005,3,1,"SIU","ztiuztrugztru","OKEY123243214",1,1,2,"NON","2022-04-12",5,"2027-04-12",13);
insert into item values (22006,3,2,"SIU","ewqaewqrfef","ZRUT74657",1,1,2,"PEUTETRE","2022-04-12",5,"2027-04-12",120000);
insert into item values (22008,2,3,"SIU","trhzterdterd","ERWTWSE43654365",1,1,2,"NON","2022-04-12",5,"2027-04-12",122223300);

insert into droit (name) values ("ADMINISTRATEUR"),("LIRE"),("ECRIRE"),("AUCUN");


select * from droit
