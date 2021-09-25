---
layout: post
title: "Hello World!"
---

# Hello World

Hello 👋🏻

{% highlight ruby linenos %}
def foo
puts 'foo'
end
{% endhighlight %}

```python
import urllib2
[...]
```

```python
import urllib2
[...]
```

{% highlight csharp %}

using Serato.Net.Structs;
using System;
using System.Buffers;
using System.Buffers.Binary;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection.Emit;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Serato.Net.Util;
using Microsoft.Extensions.Logging;

namespace Serato.Net.Services
{
public sealed class SessionFileParser : IDisposable, IAsyncDisposable
{
public event FinishedParsingTracksEventHandler? FinishedParsingTracks;
private readonly Mutex _mut;
private FileStream? _stream;
private BinaryReader? _reader;
private readonly List<AdatStruct> _adatList;

        private readonly IEnumerable<FieldPropertiesAttribute> _attributes =
            (IEnumerable<FieldPropertiesAttribute>)typeof(TrackInfo).GetCustomAttributes(
                typeof(FieldPropertiesAttribute), false);

        private readonly ILogger<SessionFileParser> _logger;

        public SessionFileParser(ILogger<SessionFileParser> logger, FileWatcher fileWatcher) : this(logger, fileWatcher, true)
        {

        }
        public SessionFileParser(ILogger<SessionFileParser> logger, FileWatcher fileWatcher, bool bindEvents = true)
        {
            _logger = logger;
            _mut = new Mutex();
            _adatList = new List<AdatStruct>();
            Initialize(fileWatcher, bindEvents);
        }

        private void Initialize(FileWatcher fileWatcher, bool bindEvents = true)
        {
            if (bindEvents)
                fileWatcher.SessionFileChanged += async (sender, e) => await ParseSessionFile(sender, e);
        }

        private async Task ParseSessionFile(object sender, FileSystemEventArgs e)
        {
            _mut.WaitOne();
            try
            {
                _stream = File.OpenRead(e.FullPath);
                _stream.Position = 0;
                _reader = new BinaryReader(_stream);
                await ParseFile();
                var tracks = ProcessTrackInfo();
                await OnFinishedParsingTracks(new FinishedParsingTracksEventArgs(tracks, e.Name));
            }
            catch (IOException exception)
            {
                _logger.Log(LogLevel.Error, exception.ToString());
                Console.WriteLine(exception);
            }
            finally
            {
                _adatList?.Clear();
                _reader?.Close();
                _stream?.Close();
                _mut.ReleaseMutex();
            }
        }

        private async Task ParseFile()
        {
            if (_reader == null)
                throw new InvalidOperationException($"{nameof(_reader)} is null");
            while (_reader.BaseStream.Length - _reader.BaseStream.Position >= 8)
            {
                await ParseHeaderWithChunk();
            }
        }

        private async Task ParseHeaderWithChunk()
        {
            if (_reader == null)
                throw new InvalidOperationException($"{nameof(_reader)} is null");
            var header = new ChunkHeader()
            {
                Identifier = Encoding.UTF8.GetString(_reader.ReadBytes(4)),
                Length = BinaryPrimitives.ReadInt32BigEndian(_reader.ReadBytes(4))
            };
            await ParseChunk(header);
        }

        private async Task ParseChunk(ChunkHeader header)
        {
            Task parserTask = header.Identifier switch
            {
                "vrsn" => ParseVrsnChunk(header.Length),
                "oent" => ParseHeaderWithChunk(),
                "adat" => ParseAdatChunk(header.Length),
                _ => Task.CompletedTask,
            };
            await parserTask;
        }

        public Task ParseVrsnChunk(int length)
        {
            return Task.CompletedTask;
        }

        public Task ParseAdatChunk(int length)
        {
            if (_reader == null)
                throw new InvalidOperationException($"{nameof(_reader)} is null");
            _adatList?.Add(new AdatStruct()
            {
                Data = _reader.ReadBytes(length)
            });
            return Task.CompletedTask;
        }

        public async IAsyncEnumerable<TrackInfo> ProcessTrackInfo()
        {
            foreach (var adat in _adatList)
            {
                var ti = new TrackInfo();
                await using var mem = new MemoryStream(adat.Data);
                using var r = new BinaryReader(mem);
                while (r.PeekChar() > -1)
                {
                    var id = BinaryPrimitives.ReadInt32BigEndian(r.ReadBytes(4));
                    var length = BinaryPrimitives.ReadInt32BigEndian(r.ReadBytes(4));
                    var data = r.ReadBytes(length);
                    await ParseField(id, data, ref ti);
                }
                _logger.Log(LogLevel.Information, ti.ToString());
                yield return ti;
            }
        }

        private Task ParseField(int id, byte[] data, ref TrackInfo ti)
        {
            var prop = typeof(TrackInfo).GetProperties()
                .FirstOrDefault(p => (p.CustomAttributes?.Any(c =>
                        c.AttributeType == typeof(FieldPropertiesAttribute) &&
                        (c.ConstructorArguments[0].Value is int argId && argId == id)))
                    .GetValueOrDefault());
            if (prop == null) return Task.CompletedTask;
            var t = prop.PropertyType;
            if (t == typeof(int))
            {
                if (data.Length == 1)
                {
                    prop.SetValue(ti, (int)data[0]);
                }
                else
                {
                    prop.SetValue(ti, BinaryPrimitives.ReadInt32BigEndian(data));
                }
            }
            else if (t == typeof(string))
            {
                prop.SetValue(ti, Encoding.BigEndianUnicode.GetString(data).Replace("\0", string.Empty));
            }
            else if (t == typeof(DateTimeOffset))
            {
                prop.SetValue(ti, DateTimeOffset.FromUnixTimeSeconds(BinaryPrimitives.ReadInt64BigEndian(data)));
            }
            else if (t == typeof(TimeSpan))
            {
                prop.SetValue(ti, TimeSpan.FromSeconds(BinaryPrimitives.ReadInt64BigEndian(data)));
            }

            return Task.CompletedTask;
        }

        private async Task OnFinishedParsingTracks(FinishedParsingTracksEventArgs e)
        {
            if(FinishedParsingTracks != null)
                await FinishedParsingTracks(this, e);
        }

        public delegate Task FinishedParsingTracksEventHandler(object sender, FinishedParsingTracksEventArgs e);

        public void Dispose()
        {
            _mut.Dispose();
            _stream?.Dispose();
            _reader?.Dispose();
        }

        public async ValueTask DisposeAsync()
        {
            if (_stream != null)
                await _stream.DisposeAsync();
            _mut.Dispose();
            _reader?.Dispose();
        }
    }

}
{% endhighlight %}

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Diam quis enim lobortis scelerisque fermentum dui. Maecenas accumsan lacus vel facilisis volutpat est. Sit amet risus nullam eget felis eget. Nisl purus in mollis nunc sed id semper. Non enim praesent elementum facilisis leo vel fringilla est ullamcorper. Donec ultrices tincidunt arcu non sodales neque sodales. Tristique nulla aliquet enim tortor at auctor urna nunc id. Pharetra massa massa ultricies mi quis hendrerit dolor magna. Leo vel fringilla est ullamcorper eget. Et ultrices neque ornare aenean euismod elementum nisi. Nisl vel pretium lectus quam id leo. Aliquet risus feugiat in ante metus dictum at. Ornare suspendisse sed nisi lacus. Sed arcu non odio euismod lacinia at. Orci nulla pellentesque dignissim enim sit amet. Lorem mollis aliquam ut porttitor leo a diam sollicitudin. Risus ultricies tristique nulla aliquet enim tortor. Dolor sed viverra ipsum nunc aliquet bibendum.

## Another Hello

Sapien pellentesque habitant morbi tristique senectus et netus. Fermentum posuere urna nec tincidunt praesent semper feugiat nibh sed. Mauris vitae ultricies leo integer malesuada nunc vel. Enim blandit volutpat maecenas volutpat blandit aliquam etiam erat velit. Vulputate mi sit amet mauris commodo quis imperdiet. Ridiculus mus mauris vitae ultricies leo. Vivamus at augue eget arcu dictum varius. Massa tincidunt nunc pulvinar sapien et ligula. Arcu non odio euismod lacinia at quis. Nulla porttitor massa id neque. Vel facilisis volutpat est velit egestas dui id ornare arcu. In hac habitasse platea dictumst vestibulum rhoncus est. Eros in cursus turpis massa tincidunt dui ut. Eget egestas purus viverra accumsan in nisl nisi scelerisque. Aliquam vestibulum morbi blandit cursus risus at ultrices mi tempus. Nulla facilisi morbi tempus iaculis urna.

Velit ut tortor pretium viverra suspendisse potenti nullam. Blandit aliquam etiam erat velit scelerisque. Auctor elit sed vulputate mi sit amet mauris commodo quis. Eget nullam non nisi est sit amet. Volutpat blandit aliquam etiam erat velit. Justo nec ultrices dui sapien eget mi proin sed libero. Fringilla ut morbi tincidunt augue interdum velit euismod in pellentesque. Adipiscing at in tellus integer feugiat scelerisque varius morbi enim. Molestie nunc non blandit massa enim. Ullamcorper a lacus vestibulum sed arcu non. Lacus sed turpis tincidunt id aliquet risus feugiat in. Amet mattis vulputate enim nulla aliquet porttitor lacus luctus. Enim ut tellus elementum sagittis. Hendrerit gravida rutrum quisque non tellus orci ac. Consectetur a erat nam at. Mattis vulputate enim nulla aliquet porttitor. Vestibulum mattis ullamcorper velit sed ullamcorper morbi. Maecenas ultricies mi eget mauris pharetra et ultrices.

In tellus integer feugiat scelerisque varius morbi enim nunc faucibus. Quam quisque id diam vel quam elementum pulvinar etiam non. Sit amet est placerat in egestas erat imperdiet. Et netus et malesuada fames. Morbi enim nunc faucibus a pellentesque sit amet porttitor. In nulla posuere sollicitudin aliquam ultrices. Nibh praesent tristique magna sit. Porta nibh venenatis cras sed felis eget. Tristique risus nec feugiat in fermentum posuere urna nec. Ut pharetra sit amet aliquam id diam. Risus feugiat in ante metus dictum at tempor. Nisl rhoncus mattis rhoncus urna neque viverra justo nec. Est lorem ipsum dolor sit amet consectetur adipiscing elit. Nisl nisi scelerisque eu ultrices. Maecenas ultricies mi eget mauris pharetra et ultrices neque. In vitae turpis massa sed.

Pharetra sit amet aliquam id diam maecenas ultricies. Ultricies mi quis hendrerit dolor. Enim neque volutpat ac tincidunt vitae semper. Aliquam sem fringilla ut morbi tincidunt augue. Pellentesque sit amet porttitor eget dolor. Metus vulputate eu scelerisque felis. Suspendisse ultrices gravida dictum fusce ut placerat orci. Arcu vitae elementum curabitur vitae nunc sed velit dignissim. Mattis ullamcorper velit sed ullamcorper morbi. Aliquam malesuada bibendum arcu vitae elementum curabitur vitae nunc sed. Id cursus metus aliquam eleifend mi in nulla posuere. Eros in cursus turpis massa. Etiam erat velit scelerisque in dictum non. Arcu bibendum at varius vel. Bibendum est ultricies integer quis auctor elit. Ornare aenean euismod elementum nisi quis eleifend quam adipiscing. Cras semper auctor neque vitae tempus quam.

Dui nunc mattis enim ut tellus. Auctor eu augue ut lectus arcu bibendum at. In aliquam sem fringilla ut morbi tincidunt augue interdum velit. Egestas maecenas pharetra convallis posuere. Rhoncus aenean vel elit scelerisque mauris pellentesque pulvinar. Bibendum at varius vel pharetra vel turpis nunc eget. Sem viverra aliquet eget sit amet tellus cras adipiscing enim. Netus et malesuada fames ac. Facilisis mauris sit amet massa vitae tortor condimentum. Amet aliquam id diam maecenas. Et netus et malesuada fames ac turpis. Eu lobortis elementum nibh tellus molestie nunc non. Lacus vestibulum sed arcu non odio euismod lacinia at. Quisque sagittis purus sit amet volutpat consequat.

Cursus in hac habitasse platea dictumst quisque sagittis. Varius duis at consectetur lorem donec massa. Augue eget arcu dictum varius duis at consectetur lorem donec. Nulla facilisi cras fermentum odio eu feugiat pretium. Viverra ipsum nunc aliquet bibendum enim facilisis gravida. Ac turpis egestas sed tempus urna et. Et ultrices neque ornare aenean euismod elementum nisi quis eleifend. Quis eleifend quam adipiscing vitae proin. Nec ultrices dui sapien eget mi. Posuere ac ut consequat semper viverra nam libero. Donec adipiscing tristique risus nec feugiat in fermentum posuere. Eget gravida cum sociis natoque penatibus et magnis dis parturient. Lacus sed turpis tincidunt id aliquet risus feugiat in ante. Sit amet porttitor eget dolor morbi non arcu. Proin sagittis nisl rhoncus mattis rhoncus urna neque viverra.

Lectus magna fringilla urna porttitor rhoncus dolor purus. Semper risus in hendrerit gravida rutrum quisque. Semper viverra nam libero justo. Semper feugiat nibh sed pulvinar proin. Semper viverra nam libero justo laoreet sit amet cursus. Morbi tristique senectus et netus et. Felis eget velit aliquet sagittis id. Non sodales neque sodales ut. Dictumst quisque sagittis purus sit amet volutpat. Turpis nunc eget lorem dolor sed viverra ipsum nunc aliquet. Tellus at urna condimentum mattis pellentesque id nibh.

Vel orci porta non pulvinar neque laoreet suspendisse. Tincidunt praesent semper feugiat nibh sed pulvinar proin gravida. Neque aliquam vestibulum morbi blandit cursus risus at. Nisl rhoncus mattis rhoncus urna neque viverra justo. Mauris nunc congue nisi vitae suscipit tellus mauris a. In est ante in nibh mauris cursus mattis. Tortor pretium viverra suspendisse potenti nullam ac tortor vitae purus. Nisl nisi scelerisque eu ultrices vitae auctor eu augue. Magna etiam tempor orci eu. Magna ac placerat vestibulum lectus mauris. Enim nunc faucibus a pellentesque. Elementum curabitur vitae nunc sed.

Lorem ipsum dolor sit amet consectetur adipiscing. Senectus et netus et malesuada fames. Sit amet consectetur adipiscing elit pellentesque habitant morbi tristique. Diam in arcu cursus euismod quis viverra nibh. Euismod nisi porta lorem mollis aliquam. Velit ut tortor pretium viverra suspendisse potenti nullam ac. Magna fringilla urna porttitor rhoncus. Purus viverra accumsan in nisl nisi scelerisque eu ultrices. Pretium viverra suspendisse potenti nullam ac tortor. Leo integer malesuada nunc vel risus commodo viverra. Risus pretium quam vulputate dignissim suspendisse. Nisi est sit amet facilisis magna etiam tempor orci eu. Blandit libero volutpat sed cras. Platea dictumst quisque sagittis purus sit amet volutpat consequat. Placerat vestibulum lectus mauris ultrices eros in cursus. Tellus cras adipiscing enim eu turpis egestas pretium aenean pharetra. Sed vulputate mi sit amet.
