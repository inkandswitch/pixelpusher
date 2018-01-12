import React from 'react';
import Input from './Input';
import Preview from './Preview';
import {
  generateExportString, exportedStringToProject
} from '../utils/storage';

import Project from '../records/Project'
import { keyFromShareLink } from '../utils/shareLink';

/*
  Avoid error when server-side render doesn't recognize
  localstorage (browser feature)
*/
const browserStorage = (typeof localStorage === 'undefined') ? null : localStorage;

export default class LoadDrawing extends React.Component {

  state = {
    shareLink: "",
  }

  getExportCode() {
    return generateExportString(this.props.project);
  }

  importProject() {
    const project = exportedStringToProject(this.importProjectData.value);

    if (project) {
      this.props.actions.setProject(project);
      this.props.close();
      this.props.actions.sendNotification('Project successfully imported');
    } else {
      this.props.actions.sendNotification("Sorry, the project couldn't be imported");
    }
  }

  deleteProject(id, e) {
    e.stopPropagation();

    this.props.dispatch({type: 'DELETE_PROJECT_CLICKED', id});
  }

  projectClick(project) {
    this.props.actions.setProject(project.get('id'));
    this.props.close();
  }

  shareLinkChanged = shareLink => {
    this.setState({shareLink})

    const id = keyFromShareLink(shareLink)

    const project = Project({id})

    this.projectClick(project)
  }

  giveMeProjects() {
    const projects = this.props.projects.valueSeq();

    return projects.map(project => {
      const id = project.get('id')
      return (
        <div
          key={id}
          onClick={() => { this.projectClick(project); }}
          className="load-drawing__drawing"
        >
          <Preview
            animate
            key={id}
            project={project}
            frameIndex={0}
            duration={1}
          />
          <button
            className="drawing__delete"
            onClick={(event) => { this.deleteProject(id, event); }}
          />
        </div>
      );
    });
  }

  giveMeOptions(type) {
    switch (type) {
      case 'import': {
        return (
          <div className="load-drawing">
            <h2>Paste a previously exported code</h2>
            <textarea
              className="load-drawing__import"
              ref={(c) => { this.importProjectData = c; }}
              defaultValue={''}
            />
            <button
              className="import__button"
              onClick={() => { this.importProject(); }}
            >
              Import
            </button>
          </div>
        );
      }

      case 'export': {
        return (
          <div className="load-drawing">
            <h2>Select and copy the following code. Keep it save in a text file</h2>
            <pre className="load-drawing__export">
              {`\n${this.getExportCode()}\n\n`}
            </pre>
          </div>
        );
      }

      case 'shared': {
        return (
          <div className="center">
            <div>Paste share link here:</div>
            <Input
              value={this.state.shareLink}
              onChange={this.shareLinkChanged}
            />
          </div>
        );
      }

      default:
      case 'load': {
        const drawings = this.giveMeProjects();
        const drawingsStored = drawings.size > 0;
        return (
          <div className="load-drawing">
            <h2>Select one of your awesome drawings</h2>
            <div
              className={
                `load-drawing__container
                ${!drawingsStored ? 'empty' : ''}`}
            >
              {drawingsStored ? drawings : 'Nothing awesome yet...'}
              <div className="load-drawing__spacer" />
              <div className="load-drawing__spacer" />
              <div className="load-drawing__spacer" />
            </div>
          </div>
        );
      }
    }
  }

  render() {
    return (this.giveMeOptions(this.props.loadType));
  }
}
