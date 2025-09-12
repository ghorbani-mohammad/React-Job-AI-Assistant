import '../css/sourcetag.css';

function SourceTag({ source, variant = 'default', className = '' }) {
  if (!source) return null;

  const tagClass = `source-tag source-tag--${variant} ${className}`.trim();

  return (
    <span className={tagClass}>
      {source}
    </span>
  );
}

export default SourceTag;
