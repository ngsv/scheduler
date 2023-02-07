import React from 'react';
import './InterviewerListItem.scss';
import classNames from 'classnames';

export default function InterviewerListItem(props) {

  // Give the InterviewerListItem an additional 'interviewers__item--selected' class if it is selected
  let interviewerClass = classNames('interviewers__item', {
    'interviewers__item--selected': props.selected
  })

  return (
    <li className={interviewerClass} onClick={props.setInterviewer}>
      <img
        className="interviewers__item-image"
        src={props.avatar}
        alt={props.name}
      />
      {props.selected && props.name}
    </li>
  );
}
