    // Function to save the review items to localStorage
    function saveToLocalStorage() {
      localStorage.setItem('reviews', JSON.stringify(reviews));
    }

    // Function to load the review items from localStorage
    function loadFromLocalStorage() {
      const storedReviews = localStorage.getItem('reviews');
      return storedReviews ? JSON.parse(storedReviews, (key, value) => {
        if (key === 'nextReviewDate') {
          return new Date(value);
        }
        return key === 'streak' ? parseInt(value, 10) : value;
      }) : [];
    }

    // Function to calculate the next review date for an item
    function getNextReviewDate(lastReviewDate, interval) {
      const nextReviewDate = new Date(lastReviewDate.getTime() + interval * 24 * 60 * 60 * 1000);
      return nextReviewDate;
    }

    // Function to update the Ease Factor (EF) after a review
    function updateEaseFactor(currentEF, rating) {
      const newEF = currentEF + 0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02);
      return Math.max(1.3, Math.min(newEF, 2.5)); // Limit EF to be within [1.3, 2.5]
    }

    // Function to calculate the next interval for an item
    function getNextInterval(repetitionNumber, currentInterval, easeFactor) {
      if (repetitionNumber === 1) {
        return 1; // For the first review, the interval is always 1 day
      } else if (repetitionNumber === 2) {
        return 6; // For the second review, the interval is 6 days
      } else {
        return Math.round(currentInterval * easeFactor);
      }
    }

    // Function to handle the review button click
    function reviewItem(index) {
      const review = reviews[index];
      const userAnswer = prompt(`Review: ${review.question}`);
      if (userAnswer !== null) {
        if (userAnswer.trim().toLowerCase() === review.answer.trim().toLowerCase()) {
          review.streak++;
          const rating = Math.min(5, review.streak);
          review.interval = getNextInterval(review.repetitionNumber, review.interval, review.easeFactor);
          review.easeFactor = updateEaseFactor(review.easeFactor, rating);
          review.nextReviewDate = getNextReviewDate(review.nextReviewDate, review.interval);
          review.repetitionNumber++;
          saveToLocalStorage();
          updateReviewList();
        } else {
          review.streak = 0;
          alert(`Incorrect answer. The correct answer is: ${review.answer}`);
          updateReviewList();
          saveToLocalStorage();
        }
      }
    }

    // Sample review items (initially only two items)
    let reviews = [];

    // Load review items from localStorage or use the sample reviews if none are available
    const storedReviews = loadFromLocalStorage();
    if (storedReviews.length > 0) {
      reviews = storedReviews;
    }

    // Function to add more review items dynamically
    function addReviewItem(question, answer) {
        if(storedReviews.length > 0) return false
        reviews.push({
            question,
            answer,
            repetitionNumber: 1,
            interval: 0,
            easeFactor: 2.5,
            nextReviewDate: new Date(),
            streak: 0
        });
      saveToLocalStorage();
      updateReviewList();
    }

    // Add more review items dynamically
    addReviewItem('What is the capital of Japan?', 'Tokyo');
    addReviewItem('What is 12 + 7?', '19');
    // Add more items as needed...

    // Function to update the review list in the HTML
    function updateReviewList() {
      // Sort the reviews array based on the nextReviewDate (earliest review date first)
      reviews.sort((a, b) => a.nextReviewDate - b.nextReviewDate);

      const reviewList = document.getElementById('reviewList');
      reviewList.innerHTML = '';

      reviews.forEach((review, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `Review ${index + 1}: ${review.question} (Next Review Date: ${review.nextReviewDate.toDateString()}) - Streak: ${review.streak}`;

        const reviewButton = document.createElement('button');
        reviewButton.textContent = 'Review';
        reviewButton.addEventListener('click', () => reviewItem(index));

        listItem.appendChild(reviewButton);
        reviewList.appendChild(listItem);
      });
    }

    // Initial update of the review list
    updateReviewList();
