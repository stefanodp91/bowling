# Prompt per lavorare con gli agenti AI

Sei procedure per lavorare con agenti AI, scritte come prompt riutilizzabili in qualsiasi
progetto. Sostituisci i segnaposto tra `< >` con le cose del tuo progetto.

> Questo file conserva i sei prompt nella loro forma originale, generica e in italiano. Le
> versioni istanziate per questo repository, in inglese e con i segnaposto sostituiti, sono gli
> altri file di questa cartella.

---

## 1. Il ciclo di autoapprovazione

```text
Lavora sulla lista <LISTA DI ELEMENTI DA PRODURRE>, un elemento alla volta, senza fermarti finché
la lista non è vuota.

Per ogni elemento ripeti questo ciclo:

1. LEGGI LA DOCUMENTAZIONE E LE BOCCIATURE PASSATE
   Leggi <DOCUMENTAZIONE DI PROGETTO> e le note lasciate dai giri precedenti, comprese le bocciature
   e il loro perché.

2. CERCA RIFERIMENTI CON LA RICERCA WEB
   Cerca fonti reali sull'elemento e annota nella documentazione cosa hai trovato prima di
   iniziare a costruire.

3. COSTRUISCI
   Realizza l'elemento seguendo le regole di <DOCUMENTAZIONE DI PROGETTO>.

4. CONTROLLI AUTOMATICI
   Esegui <COMANDI DI VERIFICA: test, lint, build>. Se falliscono, torna al punto 3.

5. GUARDA IL RISULTATO E GIUDICATI
   Osserva il risultato com'è davvero (<COME: screenshot, anteprima, output>) e confrontalo con i
   riferimenti del punto 2. Sii severo: non consegnare nulla di cui hai già notato una debolezza.
   - Se non regge: scrivi cosa era sbagliato e perché, correggi e torna al punto 3.
   - Se dopo 3 giri non regge ancora, o serve una decisione che non spetta a te: non chiudere.
     Annota causa, tentativi e residuo nella sezione «Da giudicare» di <FILE DI REVISIONE> e
     passa al punto 6.

6. CHIUDI, SCRIVI, PASSA AL PROSSIMO
   Aggiorna la documentazione con ciò che hai imparato, salva il lavoro (commit), e riparti dal
   punto 1 con l'elemento successivo.

A fine sessione scrivi in <FILE DI REVISIONE> dove riprendere, per chi non ha visto questa
conversazione. L'approvazione finale di ogni elemento resta umana.
```

---

## 2. Leggi prima di fare

```text
Prima di cambiare un file o di spiegare come funziona qualcosa del progetto:

1. Trova le pagine di <DOCUMENTAZIONE DI PROGETTO> che riguardano i file che toccherai e
   l'argomento del lavoro (<COMANDO O INDICE PER TROVARLE>).
2. Leggi per intero le pagine che contengono regole su quei file, e delle altre leggi solo la
   parte che ti serve. Poi apri sempre il codice a cui la pagina rimanda: la pagina dice dove
   guardare, ma è il codice a decidere.
3. Se il codice contraddice la pagina, segnalalo: aggiornare la pagina fa parte del lavoro.
4. Scrivi quali pagine hai letto prima di iniziare e di nuovo nel resoconto finale. Se nessuna
   pagina copre il lavoro, dillo.

Non serve per le operazioni pure: un commit di lavoro già fatto, un comando noto, git.
```

---

## 3. Aggiorna la documentazione dopo una modifica

```text
Hai appena modificato il codice. Prima di chiudere:

1. Trova le pagine di <DOCUMENTAZIONE DI PROGETTO> che descrivono i file cambiati
   (<COMANDO CHE INCROCIA IL DIFF CON LE PAGINE>, oppure a mano). Elenca anche i file
   importanti che nessuna pagina descrive.
2. Confronta ogni pagina con il codice nuovo. Aggiornala solo dopo averla verificata, e segna
   la data di verifica.
3. Se per stabilire un fatto hai dovuto leggere più di due file, e quel fatto non è scritto da
   nessuna parte, scrivilo. Scrivi la conclusione al presente, non il racconto dell'indagine:
   il racconto va nel log.
4. Aggiungi una riga al log della documentazione.
5. Esegui <CONTROLLI DELLA DOCUMENTAZIONE: lint, link, indici> e non chiudere finché non sono
   verdi.
```

---

## 4. Scrivi un handoff per chi riprende senza la chat

```text
Il lavoro su <ARGOMENTO> si interrompe qui. Scrivi o aggiorna <FILE DI HANDOFF> per un agente
o una persona che non ha visto questa conversazione.

- In cima, «Dove si riprende — <data>»: lo stato in due righe, cosa è verificato e come,
  cosa è aperto e il primo passo concreto da fare.
- Le regole di ripresa: cosa non si tocca, quali comandi sono vietati, chi decide cosa.
- Le trappole trovate sul campo, con il sintomo con cui si presentano.
- Per ogni affermazione indica la prova: commit, misura, file e riga. Niente di generico come
  «dovrebbe funzionare».

Quando il lavoro si chiude, dividi l'handoff in due:
- le conclusioni che restano vere spostale in <DOCUMENTAZIONE DI PROGETTO> e elenca dove;
- il racconto di cosa è stato fatto va nel changelog.
Non chiudere l'handoff se la lista delle conclusioni spostate è vuota.
```

---

## 5. Trasforma un errore pagato in un controllo automatico

```text
Abbiamo appena corretto <ERRORE>. Fai in modo che non torni più senza che nessuno se ne accorga.

1. Scrivi un controllo automatico che fallisce se l'errore si ripresenta, e aggiungilo a
   <PUNTO IN CUI GIRA SEMPRE: prebuild, CI, pre-commit>.
2. Dagli un'opzione --selftest che costruisce un caso sbagliato e verifica che il controllo
   lo bocci. Un controllo che non ha mai fallito non dimostra niente.
3. Se il controllo usa una soglia, ricavala dal codice o da una misura, e scrivi da dove viene.
   Non scrivere a mano numeri che dipendono da qualcos'altro.
4. Fallo girare sul codice attuale e riporta cosa trova: spesso la prima esecuzione trova
   altri casi dello stesso errore.
5. Documenta in <DOCUMENTAZIONE DI PROGETTO> cosa controlla, perché esiste e come si legge
   quando fallisce.
```

---

## 6. Scrivi un riscontro di verifica

```text
Hai verificato <COSA> su <DISPOSITIVO O AMBIENTE>. Scrivi il risultato in una pagina di
<DOCUMENTAZIONE DI PROGETTO>:

- I numeri nel testo e nelle tabelle: conteggi, soglie, esito di ogni prova, condizioni di
  partenza. Un riassunto che rimanda a un file esterno per i dettagli è incompleto.
- Lega la misura allo stato del codice che hai misurato (commit o hash dei file).
- Dichiara l'ambito: dove vale e dove non è stato provato. Un'approvazione su un dispositivo
  non si estende agli altri.
- Le immagini descrivile a parole: cosa mostravano e quale verdetto ne è seguito.
- I dati grezzi non si conservano. Resta il numero che ne hai estratto e il suo limite.
```
