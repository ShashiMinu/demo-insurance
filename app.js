(function () {
  "use strict";

  var DB_NAME = "demo-insurance-resume-v1";
  var DB_VERSION = 1;
  var STORE = "assets";

  var MAX_PHOTO_BYTES = 4 * 1024 * 1024;
  var MAX_RESUME_BYTES = 12 * 1024 * 1024;

  var photoInput = document.getElementById("photo-input");
  var resumeInput = document.getElementById("resume-input");
  var photoStatus = document.getElementById("photo-status");
  var resumeStatus = document.getElementById("resume-status");
  var clearPhotoBtn = document.getElementById("clear-photo");
  var clearResumeBtn = document.getElementById("clear-resume");
  var profilePhoto = document.getElementById("profile-photo");
  var profilePlaceholder = document.getElementById("profile-photo-placeholder");
  var resumePreviewWrap = document.getElementById("resume-preview-wrap");
  var resumeFrame = document.getElementById("resume-frame");
  var resumeFileLink = document.getElementById("resume-file-link");
  var resumeOpenTab = document.getElementById("resume-open-tab");
  var resumeToolbar = document.getElementById("resume-toolbar");

  var photoObjectUrl = null;
  var resumeObjectUrl = null;

  function openDb() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onerror = function () {
        reject(req.error);
      };
      req.onsuccess = function () {
        resolve(req.result);
      };
      req.onupgradeneeded = function (e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: "id" });
        }
      };
    });
  }

  function idbGet(id) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, "readonly");
        var st = tx.objectStore(STORE);
        var req = st.get(id);
        var row;
        req.onerror = function () {
          db.close();
          reject(req.error);
        };
        req.onsuccess = function () {
          row = req.result || null;
        };
        tx.oncomplete = function () {
          db.close();
          resolve(row);
        };
        tx.onerror = function () {
          db.close();
          reject(tx.error);
        };
      });
    });
  }

  function idbPut(record) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, "readwrite");
        var st = tx.objectStore(STORE);
        st.put(record);
        tx.oncomplete = function () {
          db.close();
          resolve();
        };
        tx.onerror = function () {
          db.close();
          reject(tx.error);
        };
      });
    });
  }

  function idbDelete(id) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, "readwrite");
        var st = tx.objectStore(STORE);
        st.delete(id);
        tx.oncomplete = function () {
          db.close();
          resolve();
        };
        tx.onerror = function () {
          db.close();
          reject(tx.error);
        };
      });
    });
  }

  function setPhotoStatus(msg, isError) {
    if (!photoStatus) return;
    photoStatus.textContent = msg || "";
    photoStatus.classList.toggle("status--error", !!isError);
  }

  function setResumeStatus(msg, isError) {
    if (!resumeStatus) return;
    resumeStatus.textContent = msg || "";
    resumeStatus.classList.toggle("status--error", !!isError);
  }

  function revokePhotoUrl() {
    if (photoObjectUrl) {
      URL.revokeObjectURL(photoObjectUrl);
      photoObjectUrl = null;
    }
  }

  function revokeResumeUrl() {
    if (resumeObjectUrl) {
      URL.revokeObjectURL(resumeObjectUrl);
      resumeObjectUrl = null;
    }
    if (resumeFrame) resumeFrame.removeAttribute("src");
  }

  function showPhotoFromBlob(blob) {
    revokePhotoUrl();
    photoObjectUrl = URL.createObjectURL(blob);
    if (profilePhoto) {
      profilePhoto.src = photoObjectUrl;
      profilePhoto.hidden = false;
    }
    if (profilePlaceholder) profilePlaceholder.hidden = true;
  }

  function hidePhoto() {
    revokePhotoUrl();
    if (profilePhoto) {
      profilePhoto.removeAttribute("src");
      profilePhoto.hidden = true;
    }
    if (profilePlaceholder) profilePlaceholder.hidden = false;
  }

  function renderResume(blob, name, mime) {
    revokeResumeUrl();
    resumeObjectUrl = URL.createObjectURL(blob);
    var isPdf = mime === "application/pdf" || (name && /\.pdf$/i.test(name));

    if (resumeFrame) {
      if (isPdf) {
        resumeFrame.src = resumeObjectUrl + "#view=FitH";
        resumeFrame.hidden = false;
      } else {
        resumeFrame.removeAttribute("src");
        resumeFrame.hidden = true;
      }
    }

    if (resumePreviewWrap) resumePreviewWrap.hidden = false;
    if (resumeToolbar) resumeToolbar.hidden = false;

    if (resumeFileLink) {
      resumeFileLink.href = resumeObjectUrl;
      resumeFileLink.download = name || "resume";
      resumeFileLink.textContent = isPdf ? "Download PDF" : "Download file";
    }
    if (resumeOpenTab) {
      resumeOpenTab.href = resumeObjectUrl;
    }

    if (!isPdf) {
      setResumeStatus("Preview is available for PDF. You can still download this file.");
    } else {
      setResumeStatus("");
    }
  }

  function hideResumeUi() {
    revokeResumeUrl();
    if (resumePreviewWrap) resumePreviewWrap.hidden = true;
    if (resumeToolbar) resumeToolbar.hidden = true;
    if (resumeFrame) {
      resumeFrame.removeAttribute("src");
      resumeFrame.hidden = true;
    }
    if (resumeFileLink) {
      resumeFileLink.removeAttribute("href");
      resumeFileLink.removeAttribute("download");
      resumeFileLink.textContent = "Download";
    }
    if (resumeOpenTab) {
      resumeOpenTab.removeAttribute("href");
    }
  }

  photoInput &&
    photoInput.addEventListener("change", function () {
      var file = photoInput.files && photoInput.files[0];
      if (!file) return;
      if (!file.type || file.type.indexOf("image/") !== 0) {
        setPhotoStatus("Please choose an image file (PNG, JPG, WebP, etc.).", true);
        photoInput.value = "";
        return;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        setPhotoStatus("Image is too large. Try one under 4 MB.", true);
        photoInput.value = "";
        return;
      }
      setPhotoStatus("Saving…");
      idbPut({ id: "photo", blob: file, name: file.name, mime: file.type })
        .then(function () {
          showPhotoFromBlob(file);
          setPhotoStatus("Saved in this browser.");
        })
        .catch(function () {
          setPhotoStatus("Could not save. Check browser storage settings.", true);
        });
    });

  resumeInput &&
    resumeInput.addEventListener("change", function () {
      var file = resumeInput.files && resumeInput.files[0];
      if (!file) return;
      if (file.size > MAX_RESUME_BYTES) {
        setResumeStatus("File is too large. Try under 12 MB.", true);
        resumeInput.value = "";
        return;
      }
      setResumeStatus("Saving…");
      idbPut({
        id: "resume",
        blob: file,
        name: file.name,
        mime: file.type || "application/octet-stream",
      })
        .then(function () {
          renderResume(file, file.name, file.type || "");
          setResumeStatus("Saved in this browser.");
        })
        .catch(function () {
          setResumeStatus("Could not save. Check browser storage settings.", true);
        });
    });

  clearPhotoBtn &&
    clearPhotoBtn.addEventListener("click", function () {
      idbDelete("photo")
        .then(function () {
          hidePhoto();
          if (photoInput) photoInput.value = "";
          setPhotoStatus("Photo removed.");
        })
        .catch(function () {
          setPhotoStatus("Could not remove saved photo.", true);
        });
    });

  clearResumeBtn &&
    clearResumeBtn.addEventListener("click", function () {
      idbDelete("resume")
        .then(function () {
          hideResumeUi();
          if (resumeInput) resumeInput.value = "";
          setResumeStatus("Resume file removed.");
        })
        .catch(function () {
          setResumeStatus("Could not remove saved file.", true);
        });
    });

  function restore() {
    idbGet("photo")
      .then(function (row) {
        if (row && row.blob) {
          var b = row.blob instanceof Blob ? row.blob : new Blob([row.blob], { type: row.mime || "image/jpeg" });
          showPhotoFromBlob(b);
          setPhotoStatus("Loaded from this browser.");
        }
      })
      .catch(function () {});

    idbGet("resume")
      .then(function (row) {
        if (row && row.blob) {
          var b = row.blob instanceof Blob ? row.blob : new Blob([row.blob], { type: row.mime || "application/pdf" });
          renderResume(b, row.name || "resume", row.mime || b.type || "");
          setResumeStatus("Loaded from this browser.");
        }
      })
      .catch(function () {});
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", restore);
  } else {
    restore();
  }
})();
