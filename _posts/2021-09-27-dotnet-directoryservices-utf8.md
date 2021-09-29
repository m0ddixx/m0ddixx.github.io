---
layout: post
title: How to use UTF-8 encoding in .NET LDAP queries
description: How to add UTF-8 support to LDAP queries in .NET 5
tags: dotnet .net5 net5 ldap encoding utf8 latin replace character protocol linux docker ubuntu debian
---

# {{page.title}}

If you are using `System.DirectoryServices.Protocols`{:.csharp .highlight} in .NET to query LDAP directories, you may encounter strange replacement characters like `�` in your results containing special characters,
especially when deploying on Linux environments.

<!--more-->

This is due to the default LDAP protocol version is 2. Microsoft added support for UTF-8 encoded string attributes in LDAP version 3 [(see here)](https://docs.microsoft.com/en-us/previous-versions/windows/desktop/ldap/differences-between-ldap-2-and-ldap-3){:target="\_blank"}.

An easy fix to this is setting the protocol version for `LdapConnection`{:.csharp .highlight} to 3 like here:

```csharp
//omitted for brevity
var connection = new LdapConnection(ldapDirectoryIdentifier, credentials)
{
    SessionOptions = { ProtocolVersion = 3 }
}
```

After that you will get correctly encoded LDAP attributes which contain special latin characters like german umlauts.

---

I hope this little guide helped you. Happy coding 🥳
