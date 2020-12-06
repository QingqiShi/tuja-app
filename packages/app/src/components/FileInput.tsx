import { useState, useRef } from 'react';
import styled, { css } from 'styled-components/macro';
import { transparentize } from 'polished';
import { RiDragDropLine, RiCloseLine, RiFileLine } from 'react-icons/ri';
import { Button, Type } from '@tuja/components';
import { theme, getTheme } from 'theme';

const Container = styled.div`
  margin-bottom: ${theme.spacings('s')};
`;

const DropArea = styled.div<{ isDragOver: boolean }>`
  width: 100%;
  display: flex;
  place-items: center;
  place-content: center;
  text-align: center;
  padding: ${theme.spacings('m')} ${theme.spacings('s')};
  border-radius: ${theme.spacings('xs')};
  border: 2px dashed
    ${getTheme(theme.colors.textOnBackground, (color) =>
      transparentize(0.9, color)
    )};
  color: ${theme.colors.textOnBackground};
  transition: all 0.2s;

  ${({ isDragOver }) =>
    isDragOver &&
    css`
      border-color: ${theme.colors.callToAction};
    `}
`;

const FileField = styled.div`
  width: 100%;
  padding: ${`${theme.spacings('s')} ${theme.spacings('s')} ${theme.spacings(
    's'
  )}
    ${theme.spacings('m')}`};
  border-radius: ${theme.spacings('xs')};
  border: 2px solid
    ${getTheme(theme.colors.textOnBackground, (color) =>
      transparentize(0.9, color)
    )};
  color: ${theme.colors.textOnBackground};
  font-size: ${theme.fonts.inputSize};
  line-height: ${theme.fonts.inputHeight};
  font-weight: ${theme.fonts.inputWeight};
  transition: all 0.2s;
  text-align: left;
  display: flex;
  place-items: center;
  > :nth-child(2) {
    margin-left: ${theme.spacings('xs')};
    flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Icon = styled.div`
  font-size: 3rem;
  color: ${getTheme(theme.colors.textOnBackground, (color) =>
    transparentize(0.5, color)
  )};
`;

const Label = styled.label`
  font-size: ${theme.fonts.labelSize};
  line-height: ${theme.fonts.labelHeight};
  font-weight: ${theme.fonts.labelWeight};
  margin-bottom: ${theme.spacings('xs')};
  display: block;
  text-align: left;
  width: 100%;
  > * {
    width: 100%;
  }
`;

const HelperText = styled.span`
  font-size: ${theme.fonts.helperSize};
  line-height: ${theme.fonts.helperHeight};
  font-weight: ${theme.fonts.helperWeight};
  margin-top: ${theme.spacings('xs')};
  color: ${getTheme(theme.colors.textOnBackground, (color) =>
    transparentize(0.5, color)
  )};
  display: block;
  text-align: left;
`;

interface UploadProps {
  accept?: string;
  onFile?: (file: File | null) => void;
}

function UploadButton({ accept, onFile }: UploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        onChange={(e) => {
          if (!e.target.files || !e.target.files[0]) return;
          if (onFile) {
            onFile(e.target.files[0]);
          }
        }}
        ref={inputRef}
        accept={accept}
        type="file"
        hidden
      />
      <Button
        variant="primary"
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        Browse Files
      </Button>
    </>
  );
}

function DragDropUpload({
  children,
  accept,
  onFile,
}: React.PropsWithChildren<UploadProps>) {
  const [isDragOver, setIsDragOver] = useState(false);
  return (
    <DropArea
      isDragOver={isDragOver}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
      }}
      onDragLeave={() => {
        setIsDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        if (
          e.dataTransfer.items &&
          e.dataTransfer.items.length &&
          e.dataTransfer.items[0].kind === 'file'
        ) {
          const file = e.dataTransfer.items[0].getAsFile();
          const isValid =
            !accept ||
            e.dataTransfer.items[0].type === accept ||
            file?.name.match(new RegExp(`${accept}$`));
          if (onFile && isValid) {
            onFile(file);
          } else if (onFile) {
            onFile(null);
          }
        } else {
          if (onFile) {
            onFile(null);
          }
        }
      }}
    >
      {children}
    </DropArea>
  );
}

interface FileInputProps extends UploadProps {
  file?: File | null;
  label?: string;
  helperText?: string;
}

function FileInput({
  onFile,
  file: externalFile,
  accept,
  label,
  helperText,
}: FileInputProps) {
  const [internalFile, setInternalFile] = useState<File | null>(null);
  const file = externalFile === undefined ? internalFile : externalFile;

  const handleFile = (file: File | null) => {
    setInternalFile(file);
    if (onFile) {
      onFile(file);
    }
  };

  return (
    <Container>
      {label && <Label>{label}</Label>}
      {file ? (
        <FileField>
          <RiFileLine />
          <div>{file.name}</div>
          <Button
            icon={<RiCloseLine />}
            onClick={() => {
              setInternalFile(null);
              if (onFile) {
                onFile(null);
              }
            }}
            type="button"
          />
        </FileField>
      ) : (
        <>
          <DragDropUpload accept={accept} onFile={handleFile}>
            <div>
              <Icon>
                <RiDragDropLine />
              </Icon>
              <Type scale="body1">Drag & drop file here, or</Type>
              <div>
                <UploadButton accept={accept} onFile={handleFile} />
              </div>
            </div>
          </DragDropUpload>
          {helperText && <HelperText>{helperText}</HelperText>}
        </>
      )}
    </Container>
  );
}

export default FileInput;
