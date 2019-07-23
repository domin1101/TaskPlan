import React from 'react';
import Choice from "./Choice";
import State from "./Global";

class Preset extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hideChoices: true
        };

        this.toggleHideChoices = this.toggleHideChoices.bind(this);
        this.onDragStart = this.onDragStart.bind(this);
        this.onDragOver = this.onDragOver.bind(this);
        this.onDragEnter = this.onDragEnter.bind(this);
        this.onDragLeave = this.onDragLeave.bind(this);
        this.onDrop = this.onDrop.bind(this);
        this.presetRef = React.createRef();
        this.dragEnterCounter = 0
    }

    toggleHideChoices() {
        this.setState({
            hideChoices: !this.state.hideChoices
        });
    }

    onDragStart(e) {
        e.dataTransfer.setData("text/plain", this.props.preset.uuid);
    }

    onDragOver(e) {
        if (this.props.sortMode && this.props.preset.uuid !== e.dataTransfer.getData("text/plain")) {
            e.preventDefault();
        }
    }

    onDrop(e) {
        if (this.props.sortMode && this.props.preset.uuid !== e.dataTransfer.getData("text/plain")) {
            e.preventDefault();
            fetch("/reorder_preset/" + this.props.project_name + "/" + e.dataTransfer.getData("text/plain") + "/" + this.props.preset.sorting)
            .then(res => res.json())
            .then(
                (result) => {

                },
                (error) => {

                }
            );

            this.dragEnterCounter = 0;
            this.presetRef.current.className = "item item-preset";
        }
    }

    onDragEnter(e) {
        if (this.props.sortMode && this.props.preset.uuid !== e.dataTransfer.getData("text/plain")) {
            e.preventDefault();
            this.presetRef.current.className = "item item-preset on-drag-over";
            this.dragEnterCounter++;
        }
    }

    onDragLeave(e) {
        if (this.props.sortMode && this.props.preset.uuid !== e.dataTransfer.getData("text/plain")) {
            e.preventDefault();
            this.dragEnterCounter--;
            if (this.dragEnterCounter === 0)
                this.presetRef.current.className = "item item-preset";
        }
    }

    render() {
        return (
            <li ref={this.presetRef} className="item item-preset" onDragOver={this.onDragOver} onDragLeave={this.onDragLeave} onDragEnter={this.onDragEnter} onDrop={this.onDrop} onDragStart={this.onDragStart} draggable={this.props.sortMode ? "true" : "false"}>
                <div className="header" onClick={() => this.toggleHideChoices()}>
                    <div className="title">{this.props.preset.name}</div>
                    {!this.props.sortMode ?
                        <div className="toolbar">
                            <div className="action" onClick={(e) => {this.props.newChoiceFunc(this.props.preset, this.props.preset.choices); e.stopPropagation();}} title="New choice">
                                <i className="fas fa-plus"></i>
                            </div>
                            <div className="action" onClick={(e) => {this.props.editPresetFunc(this.props.preset); e.stopPropagation();}} title="Edit preset">
                                <i className="fa fa-edit"></i>
                            </div>
                        </div>
                        :
                        <div className="toolbar">
                            <div className="grip-icon">
                                <i className="fas fa-bars"></i>
                            </div>
                        </div>
                    }
                </div>
                {!this.state.hideChoices && !this.props.sortMode &&
                    <ul>
                        {this.props.preset.choices.sort((a, b) => {
                            return a.name.localeCompare(b.name);
                        }).map(choice => (
                            <Choice
                                key={choice.uuid}
                                choice={choice}
                                preset={this.props.preset}
                                editFunc={this.props.editChoiceFunc}
                            />
                        ))}
                    </ul>
                }
            </li>
        );
    }
}

export default Preset;