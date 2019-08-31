import React from 'react';
import Preset from "./Preset";

class PresetGroup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hideChoices: false
        };

        this.toggleHideChoices = this.toggleHideChoices.bind(this);
    }

    toggleHideChoices() {
        this.setState({
            hideChoices: !this.state.hideChoices
        });
    }

  render() {
        return (
            <li className="item item-preset">
                {this.props.group !== ""  &&
                    <div className="group-header" onClick={() => this.toggleHideChoices()}>
                        <div className="title">{this.props.group}</div>
                    </div>
                }
                {!this.state.hideChoices &&
                    <ul>
                        {this.props.presets.sort((a, b) => a.name.localeCompare(b.name)).map(preset => (
                            <Preset
                                key={preset.uuid}
                                preset={preset}
                                editPresetFunc={this.props.editPresetFunc}
                                editChoiceFunc={this.props.editChoiceFunc}
                                newChoiceFunc={this.props.newChoiceFunc}
                                numberOfTasksPerChoice={this.props.numberOfTasksPerChoice}
                            />
                        ))}
                </ul>
                }
            </li>
        );
    }
}

export default PresetGroup;