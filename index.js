// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = ""; // Make sure to change this!
const API = BASE + COHORT;

// === State ===
let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];

/** Updates state with all parties from the API */
async function getParties() {
  try {
    const response = await fetch(API + "/events");
    const result = await response.json();
    parties = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with a single party from the API */
async function getParty(id) {
  try {
    const response = await fetch(API + "/events/" + id);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all RSVPs from the API */
async function getRsvps() {
  try {
    const response = await fetch(API + "/rsvps");
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all guests from the API */
/** === Create a new party via POST === */
async function createParty(party) {
  try {
    const response = await fetch(API + "/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(party),
    });
    const result = await response.json();
    const newParty = result.data;

    parties.push(newParty);
    selectedParty = newParty;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** === Delete a party via DELETE === */
async function deleteParty(id) {
  try {
    await fetch(API + "/events/" + id, {
      method: "DELETE",
    });

    parties = parties.filter((party) => party.id !== id);

    if (selectedParty && selectedParty.id === id) {
      selectedParty = parties[0] || null;
    }

    render();
  } catch (e) {
    console.error(e);
  }
}

async function getGuests() {
  try {
    const response = await fetch(API + "/guests");
    const result = await response.json();
    guests = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

// === Components ===

/** Party name that shows more details about the party when clicked */
function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `
    <a href="#selected">${party.name}</a>
  `;
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}

/** A list of names of all parties */
function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);

  return $ul;
}

/** Detailed information about the selected party */
function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.slice(0, 10)}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>

<button class="delete-btn">Delete Party</button>

    <GuestList></GuestList>
  `;
  $party.querySelector(".delete-btn").addEventListener("click", () => {
    deleteParty(selectedParty.id);
  });

  $party.querySelector("GuestList").replaceWith(GuestList());

  return $party;
}

/** List of guests attending the selected party */
function GuestList() {
  const $ul = document.createElement("ul");
  const guestsAtParty = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id
    )
  );

  /** === Form for adding a new party === */
  function PartyForm() {
    const $section = document.createElement("section");

    const $h2 = document.createElement("h2");
    $h2.textContent = "Add a new party";
    $section.appendChild($h2);

    const $form = document.createElement("form");

    // Name
    const nameInput = document.createElement("input");
    nameInput.placeholder = "Name";
    nameInput.required = true;
    $form.appendChild(nameInput);

    // Description
    const descInput = document.createElement("input");
    descInput.placeholder = "Description";
    descInput.required = true;
    $form.appendChild(descInput);

    // Date
    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.required = true;
    $form.appendChild(dateInput);

    // Location
    const locInput = document.createElement("input");
    locInput.placeholder = "Location";
    locInput.required = true;
    $form.appendChild(locInput);

    // Button
    const btn = document.createElement("button");
    btn.type = "submit";
    btn.textContent = "Add party";
    $form.appendChild(btn);

    // Submit handler
    $form.addEventListener("submit", (e) => {
      e.preventDefault();

      const isoDate = new Date(dateInput.value).toISOString();

      const newParty = {
        name: nameInput.value,
        description: descInput.value,
        date: isoDate,
        location: locInput.value,
      };

      createParty(newParty);

      nameInput.value = "";
      descInput.value = "";
      dateInput.value = "";
      locInput.value = "";
    });

    $section.appendChild($form);
    return $section;
  }

  // Simple components can also be created anonymously:
  const $guests = guestsAtParty.map((guest) => {
    const $guest = document.createElement("li");
    $guest.textContent = guest.name;
    return $guest;
  });
  $ul.replaceChildren(...$guests);

  return $ul;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
        <PartyForm></PartyForm>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
    </main>
  `;

  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("SelectedParty").replaceWith(SelectedParty());
  $app.querySelector("PartyForm").replaceWith(PartyForm());
}

async function init() {
  await getParties();
  await getRsvps();
  await getGuests();
  render();
}

init();
