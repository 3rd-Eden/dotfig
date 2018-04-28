# dotfig

The `dotfig` library allows you to read user specified configuration from either
the `package.json` or a dedicated `.dotfilerc` file. This gives users the freedom
to keep simple configuration in the package.json, but when it grows to big for
their liking, to move it to a dedicated dot file.

## Installation

```
npm install --save dotfig
```

## API

```js
const dotfig = require('dotfig');
```

There are 2 different ways that you can use this module, [basic](#basic) or
[advanced](#advanced).

#### Basic

```js
const config = dotfig('example');
```

You supply the required function with a `name`. This name will be the property
that we search for in `package.json` files and will be used as part of the
filename for a dedicated config file. If you set name to `foo` your config
filename will be `.foorc`, so we add a `.` and suffix with `rc`.

When we are looking for the config files and traversing the directories we
will prefer dedicated dotfiles over package.json properties and the reason for
that is simple, it takes a user more effort to create a custom file, and write
their own JSON than it is to add a property to an existing `package.json` file.
The more effort it requires from the user, the higher the priority.

#### Advanced

```js
const config = dotfig({
  filename: 'config.json',
  name: 'property'
});
```

The clear difference between the **basic** mode is that we now assume you supply
the function with an object that allows you to customize the loading/reading of
the config file.

The following options can be specified;

- `name` **required** Name of the `package.json` property it should search for
  and return when it exists.
- `filename` By default we generate a filename based on the supplied `name` by
  prefixing it with a `.` and adding `rc` to the end of it, this property allows
  you to come up with a completely different filename. Alternatively, if you
  **never** want the rc file to be used, you can set this option to `false`.
- `parse` A custom parser to read the dedicated configuration file. By default
  we use the JSON parser, but you could switch things up write your own parser
  function so you can read `toml` or `yaml` contents for example.
- `root` The directory that we will start searching in. By default this will be
  the directory of the file that required the `dotfig` module and continue
  traversing the parent directory of it until we find a configuration file.
- `packjson` Name of the `package.json` file, defaults to `package.json` but
  you can also turn off searching for the `package.json` file by setting this
  value to `false`.

## License

MIT
