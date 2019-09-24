import React, { Component } from 'react';

class RecommendationDescription extends Component {
  render () {
    let description;

    switch (this.props.studyType) {
      case "error":
        description = (
          <p className="mb0">
            Unable to fetch the recommendation course. Check your Internet connection and try <a href=".">refresh the page</a>.
          </p>
        );
        break;

      case "practice":
        description = (
          <p className="mb0">
           Practice a longer lesson and mimic real usage as closely as possible. Write as fast as you can without causing misstrokes. Explore classic stories that use simple sentences and common words.
          </p>
        );
        break;

      case "drill":
        description = (
          <p className="mb0">
            Regularly drill common words to build up your muscle memory and test your skills. Write as fast and furiously as you can, aiming for a high speed score. Pick specific drills that focus on a certain kind of brief or many similar words so you can associate them together.
          </p>
        );
        break;

      case "revise":
        description = (
          <p className="mb0">
            Revise 50 briefs a day from a lesson with loads of words you want to memorise, like the top 10000 English words. Try to recall the briefs before revealing their strokes. Avoid fingerspelling or writing out the long forms of words, so you can memorise the best brief for every word.
          </p>
        );
        break;

      case "discover":
        description = (
          <p className="mb0">
            Discover 5–15 new briefs a day from various lessons, revealing their strokes as you learn to write them. Write them slowly, concentrating on accuracy and forming good habits around how you stroke word parts.
          </p>
        );
        break;

      case "compete":
        description = (
          <p className="mb0">
            To really push your speed and vocabulary, you might add some competition. Try a race.
          </p>
        );
        break;

      case "game":
        description = (
          <p className="mb0">
            You’ve been so diligent! You might take a break from drilling and try a game.
          </p>
        );
        break;

      case "wildcard":
        description = (
          <p className="mb0">
            Well done! You’ve typed a lot of words today. You might rest your hands and your mind for now, and come back in 4+&nbsp;hours.
          </p>
        );
        break;

      case "break":
        description = (
          <p className="mb0">
            Well done! You’ve typed a lot of words today. You might rest your hands and your mind for now. Save your progress and take 5&nbsp;minutes or come back in 4+&nbsp;hours.
          </p>
        );
        break;

      default:
        description = (
          <p className="mb0">
            Practice writing as fast as you can without causing misstrokes using simple sentences and common words.
          </p>
        );
        break;
    }

    return (
      <React.Fragment>
        {description}
      </React.Fragment>
    );
  }
}

export default RecommendationDescription;