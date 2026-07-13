class BaseGenerator {
  generate(level) {
    throw new Error('Method generate() must be implemented');
  }

  getTimeLimit(level) {
    // Time limit decreases as level increases:
    // Level 1: 15s, Level 2: 13s, Level 3: 11s, Level 4: 9s, Level 5: 7s, Level 6: 6s, Level 7: 5s, Level 8: 4s, Level 9: 3s, Level 10: 2s
    const times = {
      1: 15,
      2: 13,
      3: 11,
      4: 9,
      5: 7,
      6: 6,
      7: 5,
      8: 4,
      9: 3,
      10: 2
    };
    return times[level] || 15;
  }

  // Utility to generate unique, realistic distractors close to the correct answer
  generateAlternatives(correctAnswer, minVal = 0, maxOffset = 5) {
    const alternatives = new Set([correctAnswer]);
    
    // Attempt to generate 3 distinct distractors
    let attempts = 0;
    while (alternatives.size < 4 && attempts < 50) {
      attempts++;
      const offsetType = Math.floor(Math.random() * 3);
      let distractor;

      if (offsetType === 0) {
        // Close off by a small value: +/- 1, 2, 3
        const offset = (Math.floor(Math.random() * maxOffset) + 1) * (Math.random() < 0.5 ? 1 : -1);
        distractor = correctAnswer + offset;
      } else if (offsetType === 1) {
        // Off by 10 (common mental calculation slip)
        distractor = correctAnswer + (Math.random() < 0.5 ? 10 : -10);
      } else {
        // Random multiplier or simple digit swap
        const offset = Math.floor(Math.random() * 5) + 1;
        distractor = correctAnswer + (Math.random() < 0.5 ? offset : -offset);
      }

      if (distractor >= minVal && distractor !== correctAnswer) {
        alternatives.add(distractor);
      }
    }

    // If we failed to get 4, just fill with random integers
    let fallbackOffset = 1;
    while (alternatives.size < 4) {
      const distractor = correctAnswer + fallbackOffset;
      if (distractor >= minVal) {
        alternatives.add(distractor);
      }
      fallbackOffset++;
    }

    // Convert Set to array and shuffle
    return Array.from(alternatives).sort(() => Math.random() - 0.5);
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

class AdditionGenerator extends BaseGenerator {
  generate(level) {
    let num1, num2;
    
    switch (level) {
      case 1: // Single digits (1-9) + (1-9)
        num1 = this.getRandomInt(1, 9);
        num2 = this.getRandomInt(1, 9);
        break;
      case 2: // Result up to 20, slightly harder
        num1 = this.getRandomInt(5, 15);
        num2 = this.getRandomInt(1, 9);
        break;
      case 3: // Two digit (10-20) + single digit
        num1 = this.getRandomInt(10, 20);
        num2 = this.getRandomInt(1, 9);
        break;
      case 4: // Double digit (10-30) + double digit (10-30)
        num1 = this.getRandomInt(10, 30);
        num2 = this.getRandomInt(10, 30);
        break;
      case 5: // Two digit (20-50) + two digit (10-40)
        num1 = this.getRandomInt(20, 50);
        num2 = this.getRandomInt(10, 40);
        break;
      case 6: // Two digit (30-80) + two digit (20-70)
        num1 = this.getRandomInt(30, 80);
        num2 = this.getRandomInt(20, 70);
        break;
      case 7: // Two digit (50-99) + two digit (50-99)
        num1 = this.getRandomInt(50, 99);
        num2 = this.getRandomInt(50, 99);
        break;
      case 8: // Three digit (100-300) + two digit (10-99)
        num1 = this.getRandomInt(100, 300);
        num2 = this.getRandomInt(10, 99);
        break;
      case 9: // Three digit (100-500) + three digit (100-400)
        num1 = this.getRandomInt(100, 500);
        num2 = this.getRandomInt(100, 400);
        break;
      case 10: // Three digits (500-999) + three digits (500-999)
        num1 = this.getRandomInt(500, 999);
        num2 = this.getRandomInt(500, 999);
        break;
      default:
        num1 = this.getRandomInt(1, 9);
        num2 = this.getRandomInt(1, 9);
    }

    const answer = num1 + num2;
    const alternatives = this.generateAlternatives(answer, 0, 8);
    const timeLimit = this.getTimeLimit(level);

    return {
      expression: `${num1} + ${num2}`,
      symbol: '+',
      correctAnswer: answer,
      alternatives,
      timeLimit
    };
  }
}

class SubtractionGenerator extends BaseGenerator {
  generate(level) {
    let num1, num2;
    
    switch (level) {
      case 1: // Single digit - single digit (positive results)
        num1 = this.getRandomInt(2, 9);
        num2 = this.getRandomInt(1, num1); // Ensure positive or zero result
        break;
      case 2: // 10-20 minus single digit
        num1 = this.getRandomInt(10, 20);
        num2 = this.getRandomInt(1, 9);
        break;
      case 3: // 20-50 minus single digit
        num1 = this.getRandomInt(20, 50);
        num2 = this.getRandomInt(1, 9);
        break;
      case 4: // 20-50 minus double digit (10-20)
        num1 = this.getRandomInt(20, 50);
        num2 = this.getRandomInt(10, Math.min(20, num1));
        break;
      case 5: // 50-99 minus double digit (10-40)
        num1 = this.getRandomInt(50, 99);
        num2 = this.getRandomInt(10, Math.min(40, num1));
        break;
      case 6: // 100-200 minus double digit
        num1 = this.getRandomInt(100, 200);
        num2 = this.getRandomInt(10, 99);
        break;
      case 7: // 100-300 minus double/triple digit
        num1 = this.getRandomInt(100, 300);
        num2 = this.getRandomInt(50, 150);
        break;
      case 8: // 300-600 minus three digit
        num1 = this.getRandomInt(300, 600);
        num2 = this.getRandomInt(100, 299);
        break;
      case 9: // 600-999 minus three digit
        num1 = this.getRandomInt(600, 999);
        num2 = this.getRandomInt(100, 599);
        break;
      case 10: // Four digit minus three digit
        num1 = this.getRandomInt(1000, 2000);
        num2 = this.getRandomInt(100, 999);
        break;
      default:
        num1 = this.getRandomInt(5, 9);
        num2 = this.getRandomInt(1, 4);
    }

    const answer = num1 - num2;
    const alternatives = this.generateAlternatives(answer, 0, 8);
    const timeLimit = this.getTimeLimit(level);

    return {
      expression: `${num1} - ${num2}`,
      symbol: '-',
      correctAnswer: answer,
      alternatives,
      timeLimit
    };
  }
}

class MultiplicationGenerator extends BaseGenerator {
  generate(level) {
    let num1, num2;
    
    switch (level) {
      case 1: // Tabuada do 1, 2, 5 (up to 10)
        num1 = [1, 2, 5][Math.floor(Math.random() * 3)];
        num2 = this.getRandomInt(1, 10);
        break;
      case 2: // Tabuada do 3, 4
        num1 = [3, 4][Math.floor(Math.random() * 2)];
        num2 = this.getRandomInt(1, 10);
        break;
      case 3: // Tabuada do 6, 7, 8, 9
        num1 = this.getRandomInt(6, 9);
        num2 = this.getRandomInt(1, 10);
        break;
      case 4: // Multiplicando por 10, 11, 12
        num1 = this.getRandomInt(2, 9);
        num2 = [10, 11, 12][Math.floor(Math.random() * 3)];
        break;
      case 5: // Dois algarismos por um algarismo (13-20) x (2-5)
        num1 = this.getRandomInt(13, 20);
        num2 = this.getRandomInt(2, 5);
        break;
      case 6: // Dois algarismos por um algarismo (20-50) x (2-9)
        num1 = this.getRandomInt(20, 50);
        num2 = this.getRandomInt(2, 9);
        break;
      case 7: // Tabuada estendida (11-15) x (11-15)
        num1 = this.getRandomInt(11, 15);
        num2 = this.getRandomInt(11, 15);
        break;
      case 8: // Tres algarismos por um algarismo (100-200) x (2-5)
        num1 = this.getRandomInt(100, 200);
        num2 = this.getRandomInt(2, 5);
        break;
      case 9: // Tres algarismos por um algarismo (100-500) x (2-9)
        num1 = this.getRandomInt(100, 500);
        num2 = this.getRandomInt(2, 9);
        break;
      case 10: // Dois algarismos por dois algarismos (15-50) x (15-50)
        num1 = this.getRandomInt(15, 50);
        num2 = this.getRandomInt(15, 50);
        break;
      default:
        num1 = this.getRandomInt(2, 5);
        num2 = this.getRandomInt(2, 5);
    }

    // Children representation of multiplication is "x" or "×" rather than "*"
    const answer = num1 * num2;
    const alternatives = this.generateAlternatives(answer, 0, 12);
    
    // Division/Multiplication are slightly harder, give same time limits
    const timeLimit = this.getTimeLimit(level);

    return {
      expression: `${num1} × ${num2}`,
      symbol: '×',
      correctAnswer: answer,
      alternatives,
      timeLimit
    };
  }
}

class DivisionGenerator extends BaseGenerator {
  generate(level) {
    let divisor, answer;
    
    // For division to be exact, we generate the divisor and result (answer) first,
    // and calculate the dividend = divisor * answer.
    // That way, dividend / divisor = answer.
    switch (level) {
      case 1: // Divide by 1, 2, 5 (result up to 5)
        divisor = [1, 2, 5][Math.floor(Math.random() * 3)];
        answer = this.getRandomInt(1, 5);
        break;
      case 2: // Divide by 2, 3, 4 (result up to 10)
        divisor = this.getRandomInt(2, 4);
        answer = this.getRandomInt(1, 10);
        break;
      case 3: // Divide by 5, 6, 7 (result up to 10)
        divisor = this.getRandomInt(5, 7);
        answer = this.getRandomInt(1, 10);
        break;
      case 4: // Divide by 8, 9, 10 (result up to 10)
        divisor = this.getRandomInt(8, 10);
        answer = this.getRandomInt(1, 10);
        break;
      case 5: // Result between 11 and 15
        divisor = this.getRandomInt(2, 9);
        answer = this.getRandomInt(11, 15);
        break;
      case 6: // Dividend has double digits, divisor is larger
        divisor = this.getRandomInt(11, 15);
        answer = this.getRandomInt(2, 10);
        break;
      case 7: // Result is 15 to 25, divisor 2 to 9
        divisor = this.getRandomInt(2, 9);
        answer = this.getRandomInt(15, 25);
        break;
      case 8: // Result is 20 to 50, divisor 2 to 9
        divisor = this.getRandomInt(2, 9);
        answer = this.getRandomInt(20, 50);
        break;
      case 9: // High number division
        divisor = this.getRandomInt(11, 25);
        answer = this.getRandomInt(11, 25);
        break;
      case 10: // Extreme mental division
        divisor = this.getRandomInt(12, 50);
        answer = this.getRandomInt(10, 99);
        break;
      default:
        divisor = this.getRandomInt(2, 5);
        answer = this.getRandomInt(2, 5);
    }

    const dividend = divisor * answer;
    const alternatives = this.generateAlternatives(answer, 0, 8);
    const timeLimit = this.getTimeLimit(level);

    // Children representation of division is "÷" rather than "/"
    return {
      expression: `${dividend} ÷ ${divisor}`,
      symbol: '÷',
      correctAnswer: answer,
      alternatives,
      timeLimit
    };
  }
}

class GameService {
  constructor() {
    this.generators = {
      addition: new AdditionGenerator(),
      subtraction: new SubtractionGenerator(),
      multiplication: new MultiplicationGenerator(),
      division: new DivisionGenerator()
    };
  }

  generateSessionQuestions(operation, level, count = 10) {
    const generator = this.generators[operation];
    if (!generator) {
      throw new Error(`Unsupported operation: ${operation}`);
    }

    const questions = [];
    for (let i = 0; i < count; i++) {
      questions.push(generator.generate(parseInt(level, 10)));
    }
    return questions;
  }
}

module.exports = new GameService();
