/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import { Text as DefaultText, View as DefaultView } from 'react-native';

export type TextProps = DefaultText['props'];
export type ViewProps = DefaultView['props'];

export function Text(props: TextProps) {
  const { style, ...otherProps } = props;
  return (
    <DefaultText
      style={[{ color: '#000000' }, style]}
      {...otherProps}
    />
  );
}

export function View(props: ViewProps) {
  const { style, ...otherProps } = props;
  return (
    <DefaultView
      style={[{ backgroundColor: '#FFFFFF' }, style]}
      {...otherProps}
    />
  );
}
