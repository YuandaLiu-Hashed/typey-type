import React, { Component } from 'react';
import LessonCanvasFooter from '../pages/lessons/LessonCanvasFooter';
import FinishedZeroAndEmptyStateMessage from '../pages/lessons/FinishedZeroAndEmptyState';
import UserSettings from './UserSettings';
import { IconRestart } from './Icon';
import { Link } from 'react-router-dom';
import { stitchTogetherLessonData, transformLessonDataToChartData } from '../utils/transformingFinishedData'
import FinishedDataViz from '../pages/lessons/FinishedDataViz';
import * as Confetti from './../utils/confetti';
import 'react-tippy/dist/tippy.css'

// fullURL = "https://docs.google.com/forms/d/e/1FAIpQLSda64Wi5L-eVzZVo6HLJ2xnD9cu83H2-2af3WEE2atFiaoKyw/viewform?usp=pp_url&entry.1884511690=lesson&entry.1202724812&entry.936119214";
const googleFormURL = "https://docs.google.com/forms/d/e/1FAIpQLSda64Wi5L-eVzZVo6HLJ2xnD9cu83H2-2af3WEE2atFiaoKyw/viewform?usp=pp_url&entry.1884511690="
const googleFormParam = "&entry.1202724812&entry.936119214";

let particles = [];

const skipToNextLessonButton = (event) => {
  event.preventDefault();
  const button = document.querySelector("#next-lesson-button");
  if (button) {
    button.focus();
  }
}

const calculateScores = (duration, wordCount) =>
  duration > 0
    ? Math.round(Math.max(wordCount - 1, 0) / (duration / 60 / 1000))
    : 0;

const getWordWithSpacing = (wordWithoutSpacing, spacePlacement) =>
  spacePlacement === "spaceBeforeOutput"
    ? " " + wordWithoutSpacing
    : spacePlacement === "spaceAfterOutput"
    ? wordWithoutSpacing + " "
    : wordWithoutSpacing;

class Finished extends Component {
  constructor(props) {
    super(props);
    this.state = {
      canvasWidth: Math.floor(window.innerWidth),
      canvasHeight: Math.floor(window.innerHeight),
      newTopSpeedPersonalBest: false,
      newTopSpeedToday: false,
      chartData: null
    }
  }

  componentDidMount() {
    const wpm = calculateScores(this.props.timer, this.props.totalNumberOfMatchedWords);

    const lessonData = stitchTogetherLessonData(this.props.currentLessonStrokes, this.props.startTime, wpm);
    this.setState({chartData: transformLessonDataToChartData(lessonData)})

    const fasterSpeedToday = wpm > this.props.topSpeedToday;
    const fasterPersonalBest = wpm > this.props.topSpeedPersonalBest;
    const minimumStrokes = this.props.currentLessonStrokes.length > 3;
    const minimumSpeed = wpm > 3;
    const thirtyStrokesOrNotRevision = (!this.props.revisionMode || this.props.currentLessonStrokes.length >= 30);

    if (fasterSpeedToday && minimumStrokes && minimumSpeed && thirtyStrokesOrNotRevision && fasterPersonalBest) {
      Confetti.setupCanvas({sparsity: 17, colors: 5}, 'finished-heading', particles);
      this.props.updateTopSpeedToday(wpm);
      this.props.updateTopSpeedPersonalBest(wpm);
      Confetti.restartAnimation(particles, this.refs.canvas, this.state.canvasWidth, this.state.canvasHeight);
      this.setState({
        newTopSpeedPersonalBest: true,
        newTopSpeedToday: true
      });
    }
    else if (fasterSpeedToday && minimumStrokes && minimumSpeed && thirtyStrokesOrNotRevision) {
      Confetti.setupCanvas({sparsity: 170, colors: 2}, 'finished-heading', particles);
      this.props.updateTopSpeedToday(wpm);
      Confetti.restartAnimation(particles, this.refs.canvas, this.state.canvasWidth, this.state.canvasHeight);
      this.setState({
        newTopSpeedPersonalBest: false,
        newTopSpeedToday: true
      });
    }
    else {
      this.setState({
        newTopSpeedPersonalBest: false,
        newTopSpeedToday: false
      });
    }

    if (this.finishedHeading) {
      this.finishedHeading.focus();
    }
  }

  restartConfetti(event) {
    if (event && ((event.keyCode && event.keyCode === 13) || event.type === "click")) {
      particles.splice(0);
      Confetti.cancelAnimation();
      if (this.state.newTopSpeedToday && this.state.newTopSpeedPersonalBest) {
        Confetti.setupCanvas({sparsity: 17, colors: 5}, 'finished-heading', particles);
      }
      else if (this.state.newTopSpeedToday) {
        Confetti.setupCanvas({sparsity: 170, colors: 2}, 'finished-heading', particles);
      }
      Confetti.restartAnimation(particles, this.refs.canvas, this.state.canvasWidth, this.state.canvasHeight);
    }
  }

  render() {
    let numericAccuracy = 0;
    let accuracy = '';
    let misstrokesSummary = () => undefined;
    let strokeAttemptsPresentation;

    let listOfPossibleStrokeImprovements = undefined;
    if (this.props.currentLessonStrokes.length > 0) {
      listOfPossibleStrokeImprovements = this.props.currentLessonStrokes.map( (phrase, i) => {
        let strokeAttempts = phrase.attempts.map( ( {text, time}, j ) => {
          return(
              <li key={ j } className="nowrap di ml1"><span className="bg-warning px1">{text}</span></li>
          );
        });
        if (phrase.attempts.length > 0) {
          // We use a "punctuation space" before "You wrote" to separate it from previous phrase.
          // Test this by copying and pasting the material phrase and misstrokes text e.g. "stop You wrote: staph"
          strokeAttemptsPresentation = (
            <span>
              <p className="visually-hidden di"><span className="visually-hidden">&#8200;You wrote: </span></p>
              <ol className="unstyled-list mb0 di">
                {strokeAttempts}
              </ol>
            </span>
          );
        } else {
          strokeAttemptsPresentation = [];
        }

        const showTimesSeen = this.props.globalUserSettings?.experiments && !!this.props.globalUserSettings.experiments.timesSeen;
        const timesSeen = this.props.metWords[getWordWithSpacing(phrase.word, this.props.userSettings.spacePlacement)]

        return(
          <li key={ i } className="unstyled-list-item bg-slat p1 mb1 overflow-scroll">
            <label className="checkbox-label mt0 mb1">
              <input
                className="checkbox-input"
                type="checkbox"
                name={ i + "-checkbox" }
                id={ i + "-checkbox" }
                checked={this.props.currentLessonStrokes[i].checked}
                onChange={this.props.updateRevisionMaterial}
                />
              <span className="matched steno-material px1 nowrap">{phrase.word}</span>{showTimesSeen && timesSeen && <><span className="visually-hidden">. Times seen: </span><span className="nowrap px1">{timesSeen}</span></>}
            </label>
            {strokeAttemptsPresentation}
            <p className="pl3 mb0"><span className="visually-hidden text-small">Hint: </span><span className="steno-stroke steno-stroke--subtle text-small px1 py05">{phrase.stroke.split('').map((item, i)=><kbd className="raw-steno-key raw-steno-key--subtle text-small" key={i}>{item}</kbd>)}</span></p>
          </li>
        );
      });

      misstrokesSummary = (path, reviseLesson, listOfPossibleStrokeImprovements) => (
        <div className="misstrokes-summary">
          <div>
            <h4 className="mt3 nowrap">Possible stroke improvements</h4>
            <p>
              {/* eslint-disable-next-line jsx-a11y/no-access-key */}
              <a aria-label="Revise these words" accessKey={'r'} href={path} onClick={reviseLesson} role="button">
                <u style={{textDecorationStyle: 'double' }}>R</u>evise these words</a>
            </p>
            <ol className="mb0 unstyled-list">{listOfPossibleStrokeImprovements}</ol>
          </div>
          <p>
            <a href={path} onClick={reviseLesson} role="button">
              Revise these words</a>
          </p>
        </div>
      );
    }

    if (this.props.totalNumberOfMistypedWords === 0 && this.props.totalNumberOfHintedWords === 0) {
      accuracy = '100% accurate!';
      numericAccuracy = 100;
    }
    else if (this.props.totalNumberOfMistypedWords > 0) {
      // console.log("this.props.totalNumberOfNewWordsMet" + this.props.totalNumberOfNewWordsMet);
      // console.log("this.props.totalNumberOfLowExposuresSeen" + this.props.totalNumberOfLowExposuresSeen);
      // console.log("this.props.totalNumberOfRetainedWords" + this.props.totalNumberOfRetainedWords);
      // console.log("this.props.totalNumberOfHintedWords" + this.props.totalNumberOfHintedWords);
      // console.log("this.props.totalNumberOfMistypedWords" + this.props.totalNumberOfMistypedWords);
      //
      // Test for stopping the lesson before the end
      let accuracyPercent;
      if (this.props.currentLessonStrokes && this.props.currentLessonStrokes.length > 0) { // avoid division by zero
        accuracyPercent = (1 - ((this.props.totalNumberOfMistypedWords) / this.props.currentLessonStrokes.length)) * 100;
      } else { // this should never happen because first `if` code path handles zero state
        accuracyPercent = 100.0;
      }
      // console.log("Accuracy percent: " + accuracyPercent);
      let accuracyPercentRoundedToTwoDecimalPlaces = (Math.floor(accuracyPercent * 100) / 100);
      // console.log("Accuracy percent rounded: " + accuracyPercentRoundedToTwoDecimalPlaces);
      accuracy = '' + accuracyPercentRoundedToTwoDecimalPlaces + '% accuracy';
      numericAccuracy = accuracyPercentRoundedToTwoDecimalPlaces;
    }
    else if (this.props.totalNumberOfHintedWords >= 1) {
      accuracy = accuracy + '100% accurate! ';
      numericAccuracy = 100;
    }
    else {
      accuracy = ' Keep it up!';
      numericAccuracy = 0;
    }

    // When you have stroked nothing right, except hinted or misstroked words, show nothing instead of 0%
    if (accuracy === '0% accuracy!') {
      accuracy = '';
      numericAccuracy = 0;
    }
    const wpm = calculateScores(this.props.timer, this.props.totalNumberOfMatchedWords);
    if (wpm === 0) {
      accuracy = 'Keep trying!';
      numericAccuracy = 0;
    }

    let wpmCommentary = '';
    if (wpm > 5000) {
      wpmCommentary = 'Faster than you can think…';
    } else if (wpm > 1500) {
      wpmCommentary = 'Faster than a speed reader!';
    } else if (wpm > 300) {
      wpmCommentary = 'Faster than you can read!';
    } else if (wpm > 250) {
      wpmCommentary = 'As fast as an auctioneer!';
    } else if (wpm > 225) {
      wpmCommentary = 'Faster than a pro stenographer!';
    } else if (wpm > 160) {
      wpmCommentary = 'Faster than a stenographer!';
    } else if (wpm > 150) {
      wpmCommentary = 'Faster than you can talk!';
    } else if (wpm > 100) {
      wpmCommentary = 'Faster than a stenotype student!';
    } else if (wpm > 80) {
      wpmCommentary = 'Faster than a pro typist!';
    } else if (wpm > 60) {
      wpmCommentary = 'Faster than a good QWERTY typist!';
    } else if (wpm > 40) {
      wpmCommentary = 'Faster than your average typist!';
    } else if (wpm > 27) {
      wpmCommentary = 'Faster than hunt and peck typists';
    } else if (wpm > 22) {
      wpmCommentary = 'Faster than Morse code';
    } else if (wpm > 20) {
      wpmCommentary = 'Faster than handwriting';
    } else {
      wpmCommentary = 'Try this lesson again';
    }

    let newTopSpeedSectionOrFinished = "Finished: " + this.props.lessonTitle;

    if (this.state.newTopSpeedToday && this.state.newTopSpeedPersonalBest && wpm > 3) {
      newTopSpeedSectionOrFinished = "New personal best!";
      wpmCommentary = this.props.lessonTitle;
    }
    else if (this.state.newTopSpeedToday && !this.state.newTopSpeedPersonalBest && wpm > 3) {
      newTopSpeedSectionOrFinished = "New top speed for today!";
      wpmCommentary = this.props.lessonTitle;
    }

    return (
      <div>
        <canvas ref="canvas" width={this.state.canvasWidth} height={this.state.canvasHeight} className="fixed celebration-canvas top-0 left-0 pointer-none" />
        <div id="lesson-page" className="flex-wrap-md flex mx-auto mw-1920">
          <div id="main-lesson-area" className="flex-grow mx-auto mw-1440 min-w-0">
            <div className="mx-auto mw-1920">
              {this.props.settings?.customMessage && <h3 className='px3 pb0 mb0'>{this.props.settings.customMessage}</h3>}
            </div>
            <div className="mx-auto mw-1920 p3">
              <div className="lesson-canvas lesson-canvas--finished panel p3 mb3">
                {(this.props.lessonLength === 0) ?
                  <FinishedZeroAndEmptyStateMessage startFromWordSetting={this.props.userSettings.startFromWord} startFromWordOneClickHandler={this.props.startFromWordOne} suggestedNextUrl={this.props.suggestedNext} />
                  :
                  <div className="w-100">
                    <div className="finished-lesson mx-auto mw-1440">
                      <div className="finished-summary mb3 text-center">
                        <h3
                          className="negative-outline-offset dib text-center mt3"
                          ref={(finishedHeading) => { this.finishedHeading = finishedHeading; }}
                          tabIndex="-1"
                          id="finished-heading"
                          onClick={this.restartConfetti.bind(this)}
                          onKeyDown={this.restartConfetti.bind(this)}
                        >
                          {newTopSpeedSectionOrFinished}
                        </h3>
                        <p>{wpmCommentary}</p>
                        <FinishedDataViz
                          wpm={wpm}
                          numericAccuracy={numericAccuracy}
                          skipToNextLessonButton={skipToNextLessonButton}
                          chartData={this.state.chartData}
                          totalNumberOfNewWordsMet={this.props.totalNumberOfNewWordsMet}
                          totalNumberOfLowExposuresSeen={this.props.totalNumberOfLowExposuresSeen}
                          totalNumberOfRetainedWords={this.props.totalNumberOfRetainedWords}
                          totalNumberOfHintedWords={this.props.totalNumberOfHintedWords}
                          totalNumberOfMistypedWords={this.props.totalNumberOfMistypedWords}
                          wordsTyped={this.props.currentLessonStrokes?.length || 0}
                          setAnnouncementMessage={this.props.setAnnouncementMessage}
                        />
                        <p className="mb12">
                          {/* eslint-disable-next-line jsx-a11y/no-access-key */}
                          <a aria-label="Restart lesson" accessKey={'s'} href={process.env.PUBLIC_URL + this.props.path} onClick={this.props.restartLesson} className="mr3" role="button">
                            <IconRestart ariaHidden="true" role="presentation" iconFill="#596091" className="mr1 svg-icon-wrapper svg-baseline" />
                            Re<u style={{textDecorationStyle: 'double' }}>s</u>tart lesson</a>
                          {/* eslint-disable-next-line jsx-a11y/no-access-key */}
                          <Link aria-label="Next lesson" accessKey={'o'} id="next-lesson-button" to={this.props.suggestedNext} className="link-button dib negative-outline-offset" style={{lineHeight: 2}} role="button">
                            Next less<u style={{textDecorationLine: 'underline' }}>o</u>n
                          </Link>
                        </p>
                      </div>
                      {misstrokesSummary(this.props.path, this.props.reviseLesson, listOfPossibleStrokeImprovements)}
                    </div>
                  </div>
                }
              </div>
              <LessonCanvasFooter
                chooseStudy={this.props.chooseStudy}
                disableUserSettings={this.props.disableUserSettings}
                hideOtherSettings={this.props.hideOtherSettings}
                path={this.props.path}
                setAnnouncementMessage={this.props.setAnnouncementMessage}
                toggleHideOtherSettings={this.props.toggleHideOtherSettings}
                totalWordCount={this.props.totalWordCount}
                userSettings={this.props.userSettings}
              />
            </div>
            <p className="text-center"><a href={googleFormURL + encodeURIComponent(this.props.location?.pathname || '') + googleFormParam} className="text-small mt0" target="_blank" rel="noopener noreferrer" id="ga--lesson--give-feedback">Give feedback on this lesson (form opens in a new tab)</a></p>
          </div>
          <div>
            <UserSettings
              changeUserSetting={this.props.changeUserSetting}
              changeSortOrderUserSetting={this.props.changeSortOrderUserSetting}
              changeSpacePlacementUserSetting={this.props.changeSpacePlacementUserSetting}
              changeShowStrokesAs={this.props.changeShowStrokesAs}
              changeShowStrokesOnMisstroke={this.props.changeShowStrokesOnMisstroke}
              changeStenoLayout={this.props.changeStenoLayout}
              chooseStudy={this.props.chooseStudy}
              disableUserSettings={this.props.disableUserSettings}
              handleBeatsPerMinute={this.props.handleBeatsPerMinute}
              handleLimitWordsChange={this.props.handleLimitWordsChange}
              handleStartFromWordChange={this.props.handleStartFromWordChange}
              handleRepetitionsChange={this.props.handleRepetitionsChange}
              handleUpcomingWordsLayout={this.props.handleUpcomingWordsLayout}
              hideOtherSettings={this.props.hideOtherSettings}
              maxStartFromWord={this.props.lessonLength}
              path={this.props.path}
              revisionMode={this.props.revisionMode}
              setAnnouncementMessage={this.props.setAnnouncementMessage}
              toggleHideOtherSettings={this.props.toggleHideOtherSettings}
              totalWordCount={this.props.totalWordCount}
              userSettings={this.props.userSettings}
            />
          </div>
        </div>
      </div>
    )
  }

}

export default Finished;
