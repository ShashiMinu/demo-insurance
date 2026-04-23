(function () {
  "use strict";

  var STORAGE_KEY = "resumeTextOverridesV1";

  function $(id) {
    return document.getElementById(id);
  }

  function readSkillsFromList() {
    var ul = $("skills-list");
    if (!ul) return "";
    return Array.prototype.map
      .call(ul.querySelectorAll("li"), function (li) {
        return li.textContent.trim();
      })
      .filter(Boolean)
      .join(", ");
  }

  function readBullets(id) {
    var ul = $(id);
    if (!ul) return ["", "", ""];
    var items = ul.querySelectorAll("li");
    return [0, 1, 2].map(function (i) {
      return items[i] ? items[i].textContent.trim() : "";
    });
  }

  function readFormFromPage() {
    var b1 = readBullets("exp1-bullets");
    var b2 = readBullets("exp2-bullets");
    var emailEl = $("contact-email");
    var liEl = $("contact-linkedin");
    return {
      v: 1,
      displayName: $("display-name") ? $("display-name").textContent.trim() : "",
      pageTitle: document.title,
      tagline: $("field-tagline") ? $("field-tagline").textContent.trim() : "",
      email: emailEl ? (emailEl.getAttribute("href") || "").replace(/^mailto:/i, "") : "",
      emailLabel: emailEl ? emailEl.textContent.trim() : "",
      linkedinUrl: liEl ? liEl.getAttribute("href") || "" : "",
      linkedinLabel: liEl ? liEl.textContent.trim() : "",
      location: $("contact-location") ? $("contact-location").textContent.trim() : "",
      summary: $("field-summary") ? $("field-summary").textContent.trim() : "",
      exp1Title: $("exp1-title") ? $("exp1-title").textContent.trim() : "",
      exp1Meta: $("exp1-meta") ? $("exp1-meta").textContent.trim() : "",
      exp1B1: b1[0],
      exp1B2: b1[1],
      exp1B3: b1[2],
      exp2Title: $("exp2-title") ? $("exp2-title").textContent.trim() : "",
      exp2Meta: $("exp2-meta") ? $("exp2-meta").textContent.trim() : "",
      exp2B1: b2[0],
      exp2B2: b2[1],
      exp2B3: b2[2],
      skills: readSkillsFromList(),
      eduTitle: $("edu-title") ? $("edu-title").textContent.trim() : "",
      eduMeta: $("edu-meta") ? $("edu-meta").textContent.trim() : "",
      eduNote: $("edu-note") ? $("edu-note").textContent.trim() : "",
    };
  }

  function applySkillsCsv(csv) {
    var ul = $("skills-list");
    if (!ul) return;
    var parts = csv
      .split(/[,|\n]/g)
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
    ul.innerHTML = "";
    parts.forEach(function (text) {
      var li = document.createElement("li");
      li.textContent = text;
      ul.appendChild(li);
    });
    if (!parts.length) {
      ["Skill one", "Skill two", "Skill three"].forEach(function (text) {
        var li = document.createElement("li");
        li.textContent = text;
        ul.appendChild(li);
      });
    }
  }

  function setBullets(ulId, lines) {
    var ul = $(ulId);
    if (!ul) return;
    var lis = ul.querySelectorAll("li");
    for (var i = 0; i < lis.length; i++) {
      lis[i].textContent = lines[i] != null ? lines[i] : "";
    }
  }

  function applyData(d) {
    if (!d || d.v !== 1) return;

    var nameEl = $("display-name");
    if (nameEl && d.displayName) nameEl.textContent = d.displayName;

    var foot = $("footer-display-name");
    if (foot && d.displayName) foot.textContent = d.displayName;

    if (d.pageTitle) document.title = d.pageTitle;

    var tag = $("field-tagline");
    if (tag && d.tagline != null) tag.textContent = d.tagline;

    var emailEl = $("contact-email");
    if (emailEl) {
      if (d.email) emailEl.setAttribute("href", "mailto:" + d.email);
      if (d.emailLabel != null) emailEl.textContent = d.emailLabel || d.email;
    }

    var liEl = $("contact-linkedin");
    if (liEl) {
      if (d.linkedinUrl) liEl.setAttribute("href", d.linkedinUrl);
      if (d.linkedinLabel != null) liEl.textContent = d.linkedinLabel || "LinkedIn";
    }

    var loc = $("contact-location");
    if (loc && d.location != null) loc.textContent = d.location;

    var sum = $("field-summary");
    if (sum && d.summary != null) sum.textContent = d.summary;

    var e1t = $("exp1-title");
    if (e1t && d.exp1Title != null) e1t.textContent = d.exp1Title;
    var e1m = $("exp1-meta");
    if (e1m && d.exp1Meta != null) e1m.textContent = d.exp1Meta;
    setBullets("exp1-bullets", [d.exp1B1, d.exp1B2, d.exp1B3]);

    var e2t = $("exp2-title");
    if (e2t && d.exp2Title != null) e2t.textContent = d.exp2Title;
    var e2m = $("exp2-meta");
    if (e2m && d.exp2Meta != null) e2m.textContent = d.exp2Meta;
    setBullets("exp2-bullets", [d.exp2B1, d.exp2B2, d.exp2B3]);

    if (d.skills != null) applySkillsCsv(d.skills);

    var et = $("edu-title");
    if (et && d.eduTitle != null) et.textContent = d.eduTitle;
    var em = $("edu-meta");
    if (em && d.eduMeta != null) em.textContent = d.eduMeta;
    var en = $("edu-note");
    if (en && d.eduNote != null) en.textContent = d.eduNote;
  }

  function loadStored() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function saveStored(obj) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  }

  function fillEditorForm(d) {
    var f = $("editor-form");
    if (!f || !d) return;
    var map = [
      ["inp-display-name", d.displayName],
      ["inp-page-title", d.pageTitle],
      ["inp-tagline", d.tagline],
      ["inp-email", d.email],
      ["inp-email-label", d.emailLabel],
      ["inp-linkedin", d.linkedinUrl],
      ["inp-linkedin-label", d.linkedinLabel],
      ["inp-location", d.location],
      ["inp-summary", d.summary],
      ["inp-exp1-title", d.exp1Title],
      ["inp-exp1-meta", d.exp1Meta],
      ["inp-exp1-bullets", [d.exp1B1, d.exp1B2, d.exp1B3].filter(Boolean).join("\n")],
      ["inp-exp2-title", d.exp2Title],
      ["inp-exp2-meta", d.exp2Meta],
      ["inp-exp2-bullets", [d.exp2B1, d.exp2B2, d.exp2B3].filter(Boolean).join("\n")],
      ["inp-skills", d.skills],
      ["inp-edu-title", d.eduTitle],
      ["inp-edu-meta", d.eduMeta],
      ["inp-edu-note", d.eduNote],
    ];
    map.forEach(function (pair) {
      var el = $(pair[0]);
      if (el && pair[1] != null) el.value = pair[1];
    });
  }

  function readEditorForm() {
    function val(id) {
      var el = $(id);
      return el ? el.value.trim() : "";
    }
    function bullets(id) {
      var text = val(id);
      var lines = text.split(/\n+/).map(function (s) {
        return s.trim();
      });
      return [lines[0] || "", lines[1] || "", lines[2] || ""];
    }
    var b1 = bullets("inp-exp1-bullets");
    var b2 = bullets("inp-exp2-bullets");
    return {
      v: 1,
      displayName: val("inp-display-name") || "Shashikanth",
      pageTitle: val("inp-page-title") || (val("inp-display-name") || "Shashikanth") + " — Resume",
      tagline: val("inp-tagline"),
      email: val("inp-email"),
      emailLabel: val("inp-email-label") || val("inp-email"),
      linkedinUrl: val("inp-linkedin"),
      linkedinLabel: val("inp-linkedin-label") || "LinkedIn",
      location: val("inp-location"),
      summary: val("inp-summary"),
      exp1Title: val("inp-exp1-title"),
      exp1Meta: val("inp-exp1-meta"),
      exp1B1: b1[0],
      exp1B2: b1[1],
      exp1B3: b1[2],
      exp2Title: val("inp-exp2-title"),
      exp2Meta: val("inp-exp2-meta"),
      exp2B1: b2[0],
      exp2B2: b2[1],
      exp2B3: b2[2],
      skills: val("inp-skills"),
      eduTitle: val("inp-edu-title"),
      eduMeta: val("inp-edu-meta"),
      eduNote: val("inp-edu-note"),
    };
  }

  function setEditorStatus(msg, isError) {
    var el = $("editor-status");
    if (!el) return;
    el.textContent = msg || "";
    el.classList.toggle("status--error", !!isError);
  }

  function init() {
    var stored = loadStored();
    if (stored) applyData(stored);

    var details = $("editor-details");
    if (details) {
      details.addEventListener("toggle", function () {
        if (details.open) fillEditorForm(readFormFromPage());
      });
    }

    var saveBtn = $("editor-save");
    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        var data = readEditorForm();
        try {
          saveStored(data);
          applyData(data);
          setEditorStatus("Saved on this device. You can close this panel.");
          if (details) details.open = false;
        } catch (e) {
          setEditorStatus("Could not save (storage may be blocked).", true);
        }
      });
    }

    var clearBtn = $("editor-clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        localStorage.removeItem(STORAGE_KEY);
        setEditorStatus("Cleared. Reloading…");
        window.setTimeout(function () {
          window.location.reload();
        }, 400);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
