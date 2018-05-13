import React from 'react';
import Prompt from "./Prompt";
import { JsonEditor as Editor } from 'jsoneditor-react';
import 'jsoneditor-react/es/editor.min.css';
import ace from 'brace';
import 'brace/mode/json';

class PresetEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            preset: null,
            config: '',
            mode: 'code'
        };

        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        this.save = this.save.bind(this);
        this.new = this.new.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onModeChange = this.onModeChange.bind(this);
    }

    open(preset) {
        var data = Object.assign({}, preset.data);
        delete data.uuid;

        this.setState({
            preset: preset,
            config: data
        });
    }

    new(project_name) {
        this.close();
        this.setState({
            preset: {name: 'New preset', project_name: project_name},
            config: {config: {}}
        });
    }

    close() {
        this.setState({
            preset: null
        });

    }

    save() {
        var data = new FormData();
        data.append("data", JSON.stringify(this.state.config));

        var url = "";
        if (this.state.preset.uuid)
            url = "/edit/" + this.state.preset.project_name + "/" + this.state.preset.uuid;
        else
            url = "/add/" + this.state.preset.project_name;

        fetch(url,
            {
                method: "POST",
                body: data
            })
            .then(res => res.json())
            .then(
                (result) => {

                },
                (error) => {

                }
            );

        this.close();
    }
    

    onChange(data) {
        this.setState({
            config: data
        });
    }

    onModeChange(mode) {
        this.setState({
            mode: mode
        });
    }

    render() {
        if (this.state.preset !== null) {
            return (
                <div id="preset-editor" >
                    <div className="header">{this.state.preset.name}</div>
                    <Editor mode={this.state.mode} allowedModes={['code', 'tree']} value={this.state.config} onModeChange={this.onModeChange} onChange={this.onChange} ace={ace} history={true} />
                    <div className="buttons">
                        <div onClick={this.save}>Save</div>
                        <div onClick={this.close}>Cancel</div>
                    </div>
                </div>
            );
        } else {
            return "";
        }
    }
}

export default PresetEditor;