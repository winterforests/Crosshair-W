import CrosshairEditor from './CrosshairEditor.jsx';

export default function CrosshairPage(props) {
  return (
    <CrosshairEditor
      title="Crosshair"
      applyLabel="Apply"
      appliedLabel="Applied"
      {...props}
    />
  );
}
