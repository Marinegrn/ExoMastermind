const COLORS_STEP1 = ["red", "green", "blue", "yellow"];
const COLORS_STEP2 = ["red", "green", "blue", "yellow", "purple", "orange", "pink", "cyan"];

class Mastermind {
  constructor(step = 3, maxAttempts = 12) {

    this.step = parseInt(step);
    this.maxAttempts = maxAttempts;
    this.attempts = 0;
    this.availableColors = this.step === 1 ? COLORS_STEP1 : COLORS_STEP2;
    this.codeLength = this.step === 1 ? 2 : 4;
    this.allowDuplicates = this.step >= 3;
    this.secretCode = [];         
    this.secretCode = this.generateRandomCode();
              
  //console.log("Jeu initialisé à l'étape", this.step);
  //console.log("Code secret (pour débogage):", this.secretCode);
  };

checkValidColors(proposition) {
  if (!Array.isArray(proposition) || proposition.length !== this.codeLength) {
      return false;
    }
              
  for (let color of proposition) {
    if (!this.availableColors.includes(color)) {
        return false;
    }
  }
              
  if (!this.allowDuplicates) {
    const uniqueColors = new Set(proposition);
    if (uniqueColors.size !== proposition.length) {
      return false;
    }
  }          
      return true;
};


checkCorrectCombination(proposition) {
  return JSON.stringify(proposition) === JSON.stringify(this.secretCode);
};


evaluateGuess(proposition) {
  if (!this.checkValidColors(proposition)) {
    return { 
      valid: false, 
      message: "Proposition invalide. Vérifiez les couleurs et leurs nombres." 
      };
  }

  this.attempts++;
              
  if (this.checkCorrectCombination(proposition)) {
    return { 
      valid: true, 
      won: true, 
      exact: this.codeLength, 
      partial: 0,
      message: `Bravo ! Vous avez trouvé la combinaison en ${this.attempts} essai(s) !` 
    };
  }
              
 
  let exactMatch = 0;
  let partialMatch = 0;
              
  const codeCopy = [...this.secretCode];
  const propositionCopy = [...proposition];
              
  for (let i = 0; i < this.codeLength; i++) {
    if (propositionCopy[i] === codeCopy[i]) {
      exactMatch++;

      codeCopy[i] = null;
      propositionCopy[i] = undefined;
     }
  }
              
  for (let i = 0; i < this.codeLength; i++) {
    if (propositionCopy[i] !== undefined) {
      const index = codeCopy.indexOf(propositionCopy[i]);
        if (index !== -1) {
          partialMatch++;
          codeCopy[index] = null;
        }
    }
}
              

const outOfAttempts = this.attempts >= this.maxAttempts;
              
return {
    valid: false,
    won: false,
    gameOver: outOfAttempts,
    exact: exactMatch,
    partial: partialMatch,
    attempts: this.attempts,
    remainingAttempts: this.maxAttempts - this.attempts,
    message: outOfAttempts 
      ? `Partie terminée. Vous avez épuisé vos ${this.maxAttempts} essais. Le code était: ${this.secretCode.join(", ")}.` 
      : `Résultat: ${exactMatch} bien placé(s) et ${partialMatch} mal placé(s). Il vous reste ${this.maxAttempts - this.attempts} essais.`
  };
};


generateRandomCode() {
    const code = [];
    const colors = [...this.availableColors];
              
    for (let i = 0; i < this.codeLength; i++) {
        if (this.allowDuplicates) {
            const randomIndex = Math.floor(Math.random() * this.availableColors.length);
            code.push(this.availableColors[randomIndex]);
        } else {
            const randomIndex = Math.floor(Math.random() * colors.length);
            code.push(colors[randomIndex]);
            colors.splice(randomIndex, 1);
            }
    }
              
    return code;
};


resetGame() {
    this.attempts = 0;
    this.secretCode = this.generateRandomCode();
    return { 
        message: "Nouvelle partie initialisée", 
        secretCode: this.secretCode 
    }
};
};

      class MastermindUI {
          constructor() {
              this.game = null;
              this.selectedColors = [];
              this.initializeElements();
              this.setupEventListeners();
              this.initializeGame();
          }
          
          initializeElements() {
              // Éléments du jeu
              this.colorPalette = document.getElementById('color-palette');
              this.currentSelection = document.getElementById('current-selection');
              this.guessHistory = document.getElementById('guess-history');
              this.submitBtn = document.getElementById('submit-btn');
              this.resetBtn = document.getElementById('reset-btn');
              this.startGameBtn = document.getElementById('start-game-btn');
              this.newGameBtn = document.getElementById('new-game-btn');
              this.helpBtn = document.getElementById('help-btn');
              
              // Éléments d'information
              this.currentAttemptEl = document.getElementById('current-attempt');
              this.maxAttemptsEl = document.getElementById('max-attempts');
              this.levelDisplayEl = document.getElementById('level-display');
              
              // Éléments du modal
              this.resultModal = document.getElementById('result-modal');
              this.modalTitle = document.getElementById('modal-title');
              this.modalMessage = document.getElementById('modal-message');
              this.secretCodeEl = document.getElementById('secret-code');
              
              // Éléments des paramètres
              this.difficultySelect = document.getElementById('difficulty');
              this.attemptsSlider = document.getElementById('attempts-slider');
              this.attemptsValue = document.getElementById('attempts-value');
          }
          
          setupEventListeners() {
              // Boutons pour nouvelle partie
              this.startGameBtn.addEventListener('click', () => this.initializeGame());
              this.newGameBtn.addEventListener('click', () => {
                  this.closeModal();
                  this.initializeGame();
              });
              
              // Boutons de contrôle
              this.submitBtn.addEventListener('click', () => this.submitGuess());
              this.resetBtn.addEventListener('click', () => this.resetSelection());
              
              // Événements de paramétrage
              this.difficultySelect.addEventListener('change', () => {
                  this.levelDisplayEl.textContent = this.difficultySelect.value;
              });
              
              this.attemptsSlider.addEventListener('input', () => {
                  this.attemptsValue.textContent = this.attemptsSlider.value;
              });
              
          }
          
          initializeGame() {
              const difficulty = parseInt(this.difficultySelect.value);
              const maxAttempts = parseInt(this.attemptsSlider.value);
              
              this.game = new Mastermind(difficulty, maxAttempts);
              this.selectedColors = Array(this.game.codeLength).fill(null);
              this.updateUI();
              
              // Mettre à jour les informations
              this.currentAttemptEl.textContent = '1';
              this.maxAttemptsEl.textContent = maxAttempts;
              this.levelDisplayEl.textContent = difficulty;
              
              // Vider l'historique
              this.guessHistory.innerHTML = '';
              
              // Adapter l'interface selon le niveau
              this.setupColorPalette();
              this.setupSelectionSlots();
          }
          
          setupColorPalette() {
              const colors = this.game.availableColors;
              this.colorPalette.innerHTML = '';
              
              colors.forEach(color => {
                  const colorBtn = document.createElement('button');
                  colorBtn.className = `color-btn color-${color}`;
                  colorBtn.dataset.color = color;
                  colorBtn.addEventListener('click', () => this.selectColor(color));
                  this.colorPalette.appendChild(colorBtn);
              });
          }
          
          setupSelectionSlots() {
              this.currentSelection.innerHTML = '';
              for (let i = 0; i < this.game.codeLength; i++) {
                  const slot = document.createElement('div');
                  slot.className = 'color-slot empty';
                  slot.dataset.index = i;
                  slot.addEventListener('click', () => this.clearSlot(i));
                  this.currentSelection.appendChild(slot);
              }
          }
          
          selectColor(color) {
              // Trouver le premier emplacement vide
              const emptyIndex = this.selectedColors.indexOf(null);
              if (emptyIndex !== -1) {
                  this.selectedColors[emptyIndex] = color;
                  this.updateSelectionDisplay();
                  this.checkSubmitButton();
              }
          }
          
          clearSlot(index) {
              if (this.selectedColors[index] !== null) {
                  this.selectedColors[index] = null;
                  this.updateSelectionDisplay();
                  this.checkSubmitButton();
              }
          }
          
          resetSelection() {
              this.selectedColors = Array(this.game.codeLength).fill(null);
              this.updateSelectionDisplay();
              this.checkSubmitButton();
          }
          
          updateSelectionDisplay() {
              const slots = this.currentSelection.querySelectorAll('.color-slot');
              
              slots.forEach((slot, index) => {
                  const color = this.selectedColors[index];
                  if (color) {
                      slot.className = `color-slot color-${color}`;
                      slot.classList.remove('empty');
                  } else {
                      slot.className = 'color-slot empty';
                  }
              });
          }
          
          checkSubmitButton() {
              this.submitBtn.disabled = this.selectedColors.includes(null);
          }
          
          submitGuess() {
              const result = this.game.evaluateGuess([...this.selectedColors]);
              this.displayResult(result);
              
              // Mise à jour du compteur d'essais
              this.currentAttemptEl.textContent = this.game.attempts + 1;
              
              // Réinitialiser la sélection pour le prochain essai
              this.resetSelection();
              
              // Si la partie est terminée
              if (result.won || result.gameOver) {
                  this.showResultModal(result);
              }
          }
          
          displayResult(result) {
              const resultEntry = document.createElement('div');
              resultEntry.className = 'result-entry';
              
              // Numéro de l'essai
              const attemptNumber = document.createElement('div');
              attemptNumber.className = 'attempt-number';
              attemptNumber.textContent = result.attempts;
              resultEntry.appendChild(attemptNumber);
              
              // Afficher la proposition
              const propositionDiv = document.createElement('div');
              propositionDiv.className = 'proposition';
              this.selectedColors.forEach(color => {
                  const colorSpot = document.createElement('span');
                  colorSpot.className = `color-spot color-${color}`;
                  propositionDiv.appendChild(colorSpot);
              });
              resultEntry.appendChild(propositionDiv);
              
              // Afficher le résultat (pions)
              const resultDiv = document.createElement('div');
              resultDiv.className = 'result-feedback';
              
              // Pions bien placés
              for (let i = 0; i < result.exact; i++) {
                  const pin = document.createElement('span');
                  pin.className = 'feedback-pin pin-exact';
                  resultDiv.appendChild(pin);
              }
              
              // Pions mal placés
              for (let i = 0; i < result.partial; i++) {
                  const pin = document.createElement('span');
                  pin.className = 'feedback-pin pin-partial';
                  resultDiv.appendChild(pin);
              }
              
              resultEntry.appendChild(resultDiv);
              
              // Ajouter au début de l'historique
              this.guessHistory.insertBefore(resultEntry, this.guessHistory.firstChild);
          }
          
          showResultModal(result) {
              if (result.won) {
                  this.modalTitle.textContent = "Félicitations !";
                  this.modalMessage.textContent = `Vous avez trouvé la combinaison en ${this.game.attempts} essais !`;
                  this.displaySecretCode();
                  this.openModal();
              } else if (result.gameOver) {
                  if (this.resultModal && this.modalTitle && this.modalMessage) { // débogage 
                      this.modalTitle.textContent = "Dommage !";
                      this.modalMessage.textContent = `Vous avez épuisé tous vos essais. Le code secret était: ${this.game.secretCode.join(", ")}.`;
                      this.displaySecretCode();
                      this.openModal();
                  } else {
                      console.error("Modal elements are not properly initialized in the DOM."); // débogage, message d'erreur
                  }
              }
          }

          openModal() {
              this.resultModal.classList.add('active');
          }

          closeModal() {
              this.resultModal.classList.remove('active');
          }

          displaySecretCode() {
              this.secretCodeEl.innerHTML = '';
              this.game.secretCode.forEach(color => {
                  const colorDiv = document.createElement('div');
                  colorDiv.className = `secret-color color-${color}`;
                  this.secretCodeEl.appendChild(colorDiv);
              });
          }

          updateUI() {
              this.currentAttemptEl.textContent = this.game.attempts + 1;
              this.maxAttemptsEl.textContent = this.game.maxAttempts;
              this.levelDisplayEl.textContent = this.game.step;
          }
      }

      // Initialiser l'interface utilisateur du jeu
      document.addEventListener('DOMContentLoaded', () => {
          new MastermindUI();
          ui.initializeGame(); // Démarrer une nouvelle partie automatiquement
      });